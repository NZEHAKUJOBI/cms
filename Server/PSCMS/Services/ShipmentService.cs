using Microsoft.EntityFrameworkCore;
using PSCMS.Common;
using PSCMS.Data;
using PSCMS.DTOs.GRN;
using PSCMS.DTOs.Shipment;
using PSCMS.Models;
using PSCMS.Services.Interfaces;

namespace PSCMS.Services;

public class ShipmentService : IShipmentService
{
    private readonly AppDbContext _db;

    public ShipmentService(AppDbContext db) => _db = db;

    public async Task<PagedResult<ShipmentDto>> GetAllAsync(int page, int pageSize, Guid? facilityId, string? status)
    {
        var query = _db.Shipments
            .Include(s => s.Facility)
            .Include(s => s.Order)
            .Include(s => s.ShipmentItems).ThenInclude(si => si.Product)
            .AsQueryable();

        if (facilityId.HasValue) query = query.Where(s => s.FacilityId == facilityId);
        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<ShipmentStatus>(status, out var st))
            query = query.Where(s => s.Status == st);

        var total = await query.CountAsync();
        var items = (await query
            .OrderByDescending(s => s.ShipmentDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync())
            .Select(ToDto).ToList();

        return new PagedResult<ShipmentDto> { Items = items, TotalCount = total, Page = page, PageSize = pageSize };
    }

    public async Task<ShipmentDto?> GetByIdAsync(Guid id)
    {
        var s = await _db.Shipments
            .Include(s => s.Facility)
            .Include(s => s.Order)
            .Include(s => s.ShipmentItems).ThenInclude(si => si.Product)
            .FirstOrDefaultAsync(s => s.Id == id);
        return s is null ? null : ToDto(s);
    }

    public async Task<ShipmentDto> CreateAsync(CreateShipmentDto dto, Guid preparedBy)
    {
        var shipmentNumber = $"SHP-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";

        var shipment = new Shipment
        {
            ShipmentNumber = shipmentNumber,
            OrderId = dto.OrderId,
            FacilityId = dto.FacilityId,
            ExpectedDeliveryDate = dto.ExpectedDeliveryDate.HasValue
                ? DateTime.SpecifyKind(dto.ExpectedDeliveryDate.Value, DateTimeKind.Utc)
                : null,
            Notes = dto.Notes,
            PreparedBy = preparedBy,
            ShipmentItems = dto.ShipmentItems.Select(i => new ShipmentItem
            {
                ProductId = i.ProductId,
                Quantity = i.Quantity,
                BatchNumber = i.BatchNumber,
                ExpiryDate = i.ExpiryDate.HasValue
                    ? DateTime.SpecifyKind(i.ExpiryDate.Value, DateTimeKind.Utc)
                    : null
            }).ToList()
        };

        // Update linked order status if applicable
        if (dto.OrderId.HasValue)
        {
            var order = await _db.Orders.FindAsync(dto.OrderId.Value);
            if (order is not null && order.Status == OrderStatus.Approved)
            {
                order.Status = OrderStatus.Dispatched;
                order.UpdatedAt = DateTime.UtcNow;
            }
        }

        _db.Shipments.Add(shipment);
        await _db.SaveChangesAsync();
        return (await GetByIdAsync(shipment.Id))!;
    }

    public async Task<ShipmentDto?> UpdateStatusAsync(Guid id, UpdateShipmentStatusDto dto)
    {
        var shipment = await _db.Shipments.FindAsync(id);
        if (shipment is null) return null;

        if (!Enum.TryParse<ShipmentStatus>(dto.Status, out var newStatus))
            throw new InvalidOperationException($"Invalid shipment status: {dto.Status}.");

        shipment.Status = newStatus;
        if (dto.ActualDeliveryDate.HasValue) shipment.ActualDeliveryDate = DateTime.SpecifyKind(dto.ActualDeliveryDate.Value, DateTimeKind.Utc);
        if (dto.Notes is not null) shipment.Notes = dto.Notes;
        shipment.UpdatedAt = DateTime.UtcNow;

        // When received, update inventory
        if (newStatus == ShipmentStatus.Received)
        {
            await UpdateInventoryOnReceiptAsync(shipment);
        }

        await _db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    private async Task UpdateInventoryOnReceiptAsync(Shipment shipment)
    {
        await _db.Entry(shipment).Collection(s => s.ShipmentItems).LoadAsync();

        foreach (var item in shipment.ShipmentItems)
        {
            var inv = await _db.Inventories
                .FirstOrDefaultAsync(i => i.FacilityId == shipment.FacilityId && i.ProductId == item.ProductId);

            if (inv is not null)
            {
                inv.CurrentStock += item.Quantity;
                if (item.BatchNumber is not null) inv.BatchNumber = item.BatchNumber;
                if (item.ExpiryDate.HasValue) inv.ExpiryDate = item.ExpiryDate;
                inv.LastUpdated = DateTime.UtcNow;
            }
            else
            {
                _db.Inventories.Add(new Inventory
                {
                    FacilityId = shipment.FacilityId,
                    ProductId = item.ProductId,
                    CurrentStock = item.Quantity,
                    ReorderLevel = 0,
                    BatchNumber = item.BatchNumber,
                    ExpiryDate = item.ExpiryDate
                });
            }
        }
    }

    private static ShipmentDto ToDto(Shipment s) => new()
    {
        Id = s.Id,
        ShipmentNumber = s.ShipmentNumber,
        OrderId = s.OrderId,
        OrderNumber = s.Order?.OrderNumber,
        FacilityId = s.FacilityId,
        FacilityName = s.Facility?.Name ?? string.Empty,
        Status = s.Status.ToString(),
        ShipmentDate = s.ShipmentDate,
        ExpectedDeliveryDate = s.ExpectedDeliveryDate,
        ActualDeliveryDate = s.ActualDeliveryDate,
        Notes = s.Notes,
        CreatedAt = s.CreatedAt,
        ShipmentItems = s.ShipmentItems.Select(si => new ShipmentItemDto
        {
            Id = si.Id,
            ProductId = si.ProductId,
            ProductName = si.Product?.Name ?? string.Empty,
            ProductUnit = si.Product?.Unit ?? string.Empty,
            Quantity = si.Quantity,
            BatchNumber = si.BatchNumber,
            ExpiryDate = si.ExpiryDate
        }).ToList()
    };

    public async Task<GrnDto> SubmitGrnAsync(Guid shipmentId, SubmitGrnDto dto, Guid inspectedBy)
    {
        var shipment = await _db.Shipments
            .Include(s => s.ShipmentItems)
            .FirstOrDefaultAsync(s => s.Id == shipmentId)
            ?? throw new InvalidOperationException("Shipment not found.");

        if (shipment.Status != ShipmentStatus.Delivered && shipment.Status != ShipmentStatus.InTransit)
            throw new InvalidOperationException("GRN can only be submitted for shipments in Delivered or InTransit status.");

        if (await _db.GoodsReceiptNotes.AnyAsync(g => g.ShipmentId == shipmentId))
            throw new InvalidOperationException("A GRN has already been submitted for this shipment.");

        var allDamaged = dto.Items.All(i => i.Condition != "Good" || i.ReceivedQuantity == 0);
        var anyGood = dto.Items.Any(i => i.Condition == "Good" && i.ReceivedQuantity > 0);
        var allGood = dto.Items.All(i => i.Condition == "Good" && i.ReceivedQuantity > 0);

        var grnStatus = allGood ? GrnStatus.Accepted
            : anyGood ? GrnStatus.PartiallyAccepted
            : GrnStatus.Rejected;

        var grnNumber = $"GRN-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";

        var grn = new GoodsReceiptNote
        {
            GrnNumber = grnNumber,
            ShipmentId = shipmentId,
            FacilityId = shipment.FacilityId,
            Status = grnStatus,
            OverallNotes = dto.OverallNotes,
            InspectedBy = inspectedBy,
            Items = dto.Items.Select(i => new GoodsReceiptNoteItem
            {
                ProductId = i.ProductId,
                ExpectedQuantity = i.ExpectedQuantity,
                ReceivedQuantity = i.ReceivedQuantity,
                Condition = i.Condition,
                BatchNumber = i.BatchNumber,
                ExpiryDate = i.ExpiryDate.HasValue ? DateTime.SpecifyKind(i.ExpiryDate.Value, DateTimeKind.Utc) : null,
                Notes = i.Notes
            }).ToList()
        };

        _db.GoodsReceiptNotes.Add(grn);

        // Only update inventory for Good items with received quantity > 0
        if (grnStatus != GrnStatus.Rejected)
        {
            await _db.SaveChangesAsync(); // persist GRN first to satisfy FK

            foreach (var item in grn.Items.Where(i => i.Condition == "Good" && i.ReceivedQuantity > 0))
            {
                var inv = await _db.Inventories
                    .FirstOrDefaultAsync(i => i.FacilityId == shipment.FacilityId && i.ProductId == item.ProductId);

                int previousStock = 0;
                if (inv is not null)
                {
                    previousStock = inv.CurrentStock;
                    inv.CurrentStock += item.ReceivedQuantity;
                    if (item.BatchNumber is not null) inv.BatchNumber = item.BatchNumber;
                    if (item.ExpiryDate.HasValue) inv.ExpiryDate = item.ExpiryDate;
                    inv.LastUpdated = DateTime.UtcNow;
                }
                else
                {
                    inv = new Inventory
                    {
                        FacilityId = shipment.FacilityId,
                        ProductId = item.ProductId,
                        CurrentStock = item.ReceivedQuantity,
                        ReorderLevel = 0,
                        BatchNumber = item.BatchNumber,
                        ExpiryDate = item.ExpiryDate
                    };
                    _db.Inventories.Add(inv);
                    await _db.SaveChangesAsync(); // persist so Id is available
                }

                _db.StockLedger.Add(new StockLedger
                {
                    InventoryId = inv.Id,
                    FacilityId = inv.FacilityId,
                    ProductId = inv.ProductId,
                    PreviousStock = previousStock,
                    NewStock = previousStock + item.ReceivedQuantity,
                    ChangeAmount = item.ReceivedQuantity,
                    ChangeType = "Add",
                    Reason = $"GRN {grnNumber}",
                    ChangedBy = inspectedBy,
                    ChangedAt = DateTime.UtcNow
                });
            }
        }

        shipment.Status = ShipmentStatus.Received;
        shipment.ActualDeliveryDate ??= DateTime.UtcNow;
        shipment.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        // Reload grn with full navigation
        var saved = await _db.GoodsReceiptNotes
            .Include(g => g.Facility)
            .Include(g => g.Shipment)
            .Include(g => g.Items).ThenInclude(i => i.Product)
            .FirstAsync(g => g.Id == grn.Id);

        return ToGrnDto(saved);
    }

    private static GrnDto ToGrnDto(GoodsReceiptNote g) => new()
    {
        Id = g.Id,
        GrnNumber = g.GrnNumber,
        ShipmentId = g.ShipmentId,
        ShipmentNumber = g.Shipment?.ShipmentNumber ?? string.Empty,
        FacilityId = g.FacilityId,
        FacilityName = g.Facility?.Name ?? string.Empty,
        Status = g.Status.ToString(),
        OverallNotes = g.OverallNotes,
        InspectedAt = g.InspectedAt,
        CreatedAt = g.CreatedAt,
        Items = g.Items.Select(i => new GrnItemDto
        {
            Id = i.Id,
            ProductId = i.ProductId,
            ProductName = i.Product?.Name ?? string.Empty,
            ProductUnit = i.Product?.Unit ?? string.Empty,
            ExpectedQuantity = i.ExpectedQuantity,
            ReceivedQuantity = i.ReceivedQuantity,
            Condition = i.Condition,
            BatchNumber = i.BatchNumber,
            ExpiryDate = i.ExpiryDate,
            Notes = i.Notes
        }).ToList()
    };
}
