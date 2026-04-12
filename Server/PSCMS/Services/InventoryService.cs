using Microsoft.EntityFrameworkCore;
using PSCMS.Common;
using PSCMS.Data;
using PSCMS.DTOs.Inventory;
using PSCMS.Models;
using PSCMS.Services.Interfaces;

namespace PSCMS.Services;

public class InventoryService : IInventoryService
{
    private readonly AppDbContext _db;

    public InventoryService(AppDbContext db) => _db = db;

    public async Task<PagedResult<InventoryDto>> GetAllAsync(int page, int pageSize, Guid? facilityId, bool? lowStockOnly)
    {
        var query = _db.Inventories
            .Include(i => i.Facility)
            .Include(i => i.Product)
            .AsQueryable();

        if (facilityId.HasValue) query = query.Where(i => i.FacilityId == facilityId);
        if (lowStockOnly == true) query = query.Where(i => i.CurrentStock <= i.ReorderLevel);

        var total = await query.CountAsync();
        var items = await query
            .OrderBy(i => i.Facility.Name).ThenBy(i => i.Product.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<InventoryDto>
        {
            Items = items.Select(ToDto).ToList(),
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<InventoryDto?> GetByIdAsync(Guid id)
    {
        var inv = await _db.Inventories
            .Include(i => i.Facility)
            .Include(i => i.Product)
            .FirstOrDefaultAsync(i => i.Id == id);
        return inv is null ? null : ToDto(inv);
    }

    public async Task<List<InventoryDto>> GetByFacilityAsync(Guid facilityId)
    {
        return await _db.Inventories
            .Include(i => i.Facility)
            .Include(i => i.Product)
            .Where(i => i.FacilityId == facilityId)
            .OrderBy(i => i.Product.Name)
            .Select(i => ToDto(i))
            .ToListAsync();
    }

    public async Task<InventoryDto> CreateAsync(CreateInventoryDto dto, Guid? createdBy = null)
    {
        var exists = await _db.Inventories.AnyAsync(i => i.FacilityId == dto.FacilityId && i.ProductId == dto.ProductId);
        if (exists) throw new InvalidOperationException("Inventory record already exists for this facility and product.");

        var inv = new Inventory
        {
            FacilityId = dto.FacilityId,
            ProductId = dto.ProductId,
            CurrentStock = dto.CurrentStock,
            ReorderLevel = dto.ReorderLevel,
            BatchNumber = dto.BatchNumber,
            ExpiryDate = dto.ExpiryDate.HasValue
                ? DateTime.SpecifyKind(dto.ExpiryDate.Value, DateTimeKind.Utc)
                : null
        };
        _db.Inventories.Add(inv);

        // Record initial ledger entry
        await RecordLedgerAsync(inv, 0, inv.CurrentStock, "Initial", "Initial stock entry", createdBy);

        await _db.SaveChangesAsync();
        return await GetByIdAsync(inv.Id) ?? throw new InvalidOperationException("Failed to retrieve created inventory.");
    }

    public async Task<InventoryDto?> UpdateAsync(Guid id, UpdateInventoryDto dto)
    {
        var inv = await _db.Inventories.FindAsync(id);
        if (inv is null) return null;

        var previousStock = inv.CurrentStock;
        var stockChanged = dto.CurrentStock.HasValue && dto.CurrentStock.Value != previousStock;

        if (dto.CurrentStock.HasValue) inv.CurrentStock = dto.CurrentStock.Value;
        if (dto.ReorderLevel.HasValue) inv.ReorderLevel = dto.ReorderLevel.Value;
        if (dto.BatchNumber is not null) inv.BatchNumber = dto.BatchNumber;
        if (dto.ExpiryDate.HasValue) inv.ExpiryDate = DateTime.SpecifyKind(dto.ExpiryDate.Value, DateTimeKind.Utc);
        inv.LastUpdated = DateTime.UtcNow;

        if (stockChanged)
            await RecordLedgerAsync(inv, previousStock, inv.CurrentStock, "Set", "Manual edit", null);

        await _db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task<InventoryDto?> AdjustStockAsync(Guid id, AdjustStockDto dto, Guid? changedBy = null)
    {
        var inv = await _db.Inventories.FindAsync(id);
        if (inv is null) return null;

        var previousStock = inv.CurrentStock;
        if (dto.AdjustmentType == "Add")
            inv.CurrentStock += dto.Quantity;
        else if (dto.AdjustmentType == "Subtract")
            inv.CurrentStock = Math.Max(0, inv.CurrentStock - dto.Quantity);
        else
            throw new InvalidOperationException("AdjustmentType must be 'Add' or 'Subtract'.");

        inv.LastUpdated = DateTime.UtcNow;
        await RecordLedgerAsync(inv, previousStock, inv.CurrentStock, dto.AdjustmentType, dto.Reason, changedBy);
        await _db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task<InventoryDto?> SetStockAsync(Guid id, SetStockDto dto, Guid? changedBy = null)
    {
        var inv = await _db.Inventories.FindAsync(id);
        if (inv is null) return null;

        var previousStock = inv.CurrentStock;
        inv.CurrentStock = Math.Max(0, dto.StockOnHand);
        inv.LastUpdated = DateTime.UtcNow;

        await RecordLedgerAsync(inv, previousStock, inv.CurrentStock, "Set", dto.Reason ?? "Physical count", changedBy);
        await _db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task<List<InventoryDto>> GetLowStockAlertsAsync(Guid? facilityId)
    {
        var query = _db.Inventories
            .Include(i => i.Facility)
            .Include(i => i.Product)
            .Where(i => i.CurrentStock <= i.ReorderLevel);

        if (facilityId.HasValue) query = query.Where(i => i.FacilityId == facilityId);

        return (await query.ToListAsync()).Select(ToDto).ToList();
    }

    public async Task<List<InventoryDto>> GetNearExpiryAlertsAsync(int withinDays = 90, Guid? facilityId = null)
    {
        var threshold = DateTime.UtcNow.AddDays(withinDays);
        var query = _db.Inventories
            .Include(i => i.Facility)
            .Include(i => i.Product)
            .Where(i => i.ExpiryDate.HasValue && i.ExpiryDate.Value <= threshold);

        if (facilityId.HasValue) query = query.Where(i => i.FacilityId == facilityId);

        return await query
            .OrderBy(i => i.ExpiryDate)
            .Select(i => ToDto(i))
            .ToListAsync();
    }

    public async Task<List<StockLedgerDto>> GetStockHistoryAsync(Guid inventoryId, int days = 90)
    {
        var since = DateTime.UtcNow.AddDays(-Math.Abs(days));
        return await _db.StockLedger
            .Where(sl => sl.InventoryId == inventoryId && sl.ChangedAt >= since)
            .OrderByDescending(sl => sl.ChangedAt)
            .Select(sl => new StockLedgerDto
            {
                Id = sl.Id,
                PreviousStock = sl.PreviousStock,
                NewStock = sl.NewStock,
                ChangeAmount = sl.ChangeAmount,
                ChangeType = sl.ChangeType,
                Reason = sl.Reason,
                ChangedAt = sl.ChangedAt
            })
            .ToListAsync();
    }

    public async Task<List<WeeklySnapshotDto>> GetWeeklySnapshotsAsync(Guid inventoryId, int weeks = 12)
    {
        var since = GetWeekStart(DateTime.UtcNow).AddDays(-7 * (Math.Max(1, weeks) - 1));
        return await _db.WeeklyStockSnapshots
            .Where(s => s.InventoryId == inventoryId && s.WeekStartDate >= since)
            .OrderBy(s => s.WeekStartDate)
            .Select(s => new WeeklySnapshotDto
            {
                Id = s.Id,
                StockOnHand = s.StockOnHand,
                WeekStartDate = s.WeekStartDate,
                RecordedAt = s.RecordedAt
            })
            .ToListAsync();
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    /// <summary>Adds a StockLedger row and upserts the WeeklyStockSnapshot for the current week.</summary>
    private async Task RecordLedgerAsync(Inventory inv, int previousStock, int newStock, string changeType, string? reason, Guid? changedBy)
    {
        _db.StockLedger.Add(new StockLedger
        {
            InventoryId = inv.Id,
            FacilityId = inv.FacilityId,
            ProductId = inv.ProductId,
            PreviousStock = previousStock,
            NewStock = newStock,
            ChangeAmount = newStock - previousStock,
            ChangeType = changeType,
            Reason = reason,
            ChangedBy = changedBy,
            ChangedAt = DateTime.UtcNow
        });

        var weekStart = GetWeekStart(DateTime.UtcNow);
        var snapshot = await _db.WeeklyStockSnapshots
            .FirstOrDefaultAsync(s => s.InventoryId == inv.Id && s.WeekStartDate == weekStart);

        if (snapshot is null)
        {
            _db.WeeklyStockSnapshots.Add(new WeeklyStockSnapshot
            {
                InventoryId = inv.Id,
                FacilityId = inv.FacilityId,
                ProductId = inv.ProductId,
                StockOnHand = newStock,
                WeekStartDate = weekStart,
                RecordedAt = DateTime.UtcNow
            });
        }
        else
        {
            snapshot.StockOnHand = newStock;
            snapshot.RecordedAt = DateTime.UtcNow;
        }
    }

    /// <summary>Returns the Monday (UTC) of the week containing <paramref name="date"/>.</summary>
    private static DateTime GetWeekStart(DateTime date)
    {
        var d = date.Date;
        var offset = (int)d.DayOfWeek == 0 ? 6 : (int)d.DayOfWeek - 1;
        return DateTime.SpecifyKind(d.AddDays(-offset), DateTimeKind.Utc);
    }

    private static InventoryDto ToDto(Inventory i) => new()
    {
        Id = i.Id,
        FacilityId = i.FacilityId,
        FacilityName = i.Facility?.Name ?? string.Empty,
        ProductId = i.ProductId,
        ProductName = i.Product?.Name ?? string.Empty,
        ProductUnit = i.Product?.Unit ?? string.Empty,
        CurrentStock = i.CurrentStock,
        ReorderLevel = i.ReorderLevel,
        MinimumStockLevel = i.Product?.MinimumStockLevel ?? 0,
        IsLowStock = i.CurrentStock <= i.ReorderLevel,
        BatchNumber = i.BatchNumber,
        ExpiryDate = i.ExpiryDate,
        IsNearExpiry = i.ExpiryDate.HasValue && i.ExpiryDate.Value <= DateTime.UtcNow.AddDays(90),
        LastUpdated = i.LastUpdated
    };
}
