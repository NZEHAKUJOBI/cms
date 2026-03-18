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

    public async Task<InventoryDto> CreateAsync(CreateInventoryDto dto)
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
            ExpiryDate = dto.ExpiryDate
        };
        _db.Inventories.Add(inv);
        await _db.SaveChangesAsync();

        return await GetByIdAsync(inv.Id) ?? throw new InvalidOperationException("Failed to retrieve created inventory.");
    }

    public async Task<InventoryDto?> UpdateAsync(Guid id, UpdateInventoryDto dto)
    {
        var inv = await _db.Inventories.FindAsync(id);
        if (inv is null) return null;

        if (dto.CurrentStock.HasValue) inv.CurrentStock = dto.CurrentStock.Value;
        if (dto.ReorderLevel.HasValue) inv.ReorderLevel = dto.ReorderLevel.Value;
        if (dto.BatchNumber is not null) inv.BatchNumber = dto.BatchNumber;
        if (dto.ExpiryDate.HasValue) inv.ExpiryDate = dto.ExpiryDate;
        inv.LastUpdated = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task<InventoryDto?> AdjustStockAsync(Guid id, AdjustStockDto dto)
    {
        var inv = await _db.Inventories.FindAsync(id);
        if (inv is null) return null;

        if (dto.AdjustmentType == "Add")
            inv.CurrentStock += dto.Quantity;
        else if (dto.AdjustmentType == "Subtract")
            inv.CurrentStock = Math.Max(0, inv.CurrentStock - dto.Quantity);
        else
            throw new InvalidOperationException("AdjustmentType must be 'Add' or 'Subtract'.");

        inv.LastUpdated = DateTime.UtcNow;
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

    public async Task<List<InventoryDto>> GetNearExpiryAlertsAsync(int withinDays = 90)
    {
        var threshold = DateTime.UtcNow.AddDays(withinDays);
        return await _db.Inventories
            .Include(i => i.Facility)
            .Include(i => i.Product)
            .Where(i => i.ExpiryDate.HasValue && i.ExpiryDate.Value <= threshold)
            .OrderBy(i => i.ExpiryDate)
            .Select(i => ToDto(i))
            .ToListAsync();
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
