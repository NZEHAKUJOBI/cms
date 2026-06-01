using Microsoft.EntityFrameworkCore;
using PSCMS.Common;
using PSCMS.Data;
using PSCMS.DTOs.Transfer;
using PSCMS.Models;
using PSCMS.Services.Interfaces;

namespace PSCMS.Services;

public class TransferService : ITransferService
{
    private readonly AppDbContext _db;

    public TransferService(AppDbContext db) => _db = db;

    public async Task<PagedResult<StockTransferDto>> GetAllAsync(int page, int pageSize, Guid? facilityId, string? status, string? stateFilter = null)
    {
        var query = _db.StockTransfers
            .Include(t => t.SourceFacility)
            .Include(t => t.DestinationFacility)
            .Include(t => t.Items).ThenInclude(i => i.Product)
            .AsQueryable();

        if (facilityId.HasValue)
            query = query.Where(t => t.SourceFacilityId == facilityId || t.DestinationFacilityId == facilityId);
        if (!string.IsNullOrWhiteSpace(stateFilter))
            query = query.Where(t => t.SourceFacility.State == stateFilter || t.DestinationFacility.State == stateFilter);

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<TransferStatus>(status, out var st))
            query = query.Where(t => t.Status == st);

        var total = await query.CountAsync();
        var items = (await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync())
            .Select(ToDto).ToList();

        return new PagedResult<StockTransferDto> { Items = items, TotalCount = total, Page = page, PageSize = pageSize };
    }

    public async Task<StockTransferDto?> GetByIdAsync(Guid id)
    {
        var t = await _db.StockTransfers
            .Include(t => t.SourceFacility)
            .Include(t => t.DestinationFacility)
            .Include(t => t.Items).ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(t => t.Id == id);
        return t is null ? null : ToDto(t);
    }

    public async Task<StockTransferDto> CreateAsync(CreateStockTransferDto dto, Guid requestedBy)
    {
        if (dto.SourceFacilityId == dto.DestinationFacilityId)
            throw new InvalidOperationException("Source and destination facilities must be different.");

        var transferNumber = $"TRF-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";

        var transfer = new StockTransfer
        {
            TransferNumber = transferNumber,
            SourceFacilityId = dto.SourceFacilityId,
            DestinationFacilityId = dto.DestinationFacilityId,
            Notes = dto.Notes,
            RequestedBy = requestedBy,
            Items = dto.Items.Select(i => new StockTransferItem
            {
                ProductId = i.ProductId,
                Quantity = i.Quantity,
                BatchNumber = i.BatchNumber,
                ExpiryDate = i.ExpiryDate.HasValue ? DateTime.SpecifyKind(i.ExpiryDate.Value, DateTimeKind.Utc) : null,
                Notes = i.Notes
            }).ToList()
        };

        _db.StockTransfers.Add(transfer);
        await _db.SaveChangesAsync();
        return (await GetByIdAsync(transfer.Id))!;
    }

    public async Task<StockTransferDto?> UpdateStatusAsync(Guid id, UpdateTransferStatusDto dto, Guid updatedBy)
    {
        var transfer = await _db.StockTransfers
            .Include(t => t.Items)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (transfer is null) return null;

        if (!Enum.TryParse<TransferStatus>(dto.Status, out var newStatus))
            throw new InvalidOperationException($"Invalid transfer status: {dto.Status}.");

        // Validate transitions
        var validTransitions = transfer.Status switch
        {
            TransferStatus.Pending => new[] { TransferStatus.Approved, TransferStatus.Cancelled },
            TransferStatus.Approved => new[] { TransferStatus.InTransit, TransferStatus.Cancelled },
            TransferStatus.InTransit => new[] { TransferStatus.Completed, TransferStatus.Cancelled },
            _ => Array.Empty<TransferStatus>()
        };

        if (!validTransitions.Contains(newStatus))
            throw new InvalidOperationException($"Cannot transition from {transfer.Status} to {newStatus}.");

        if (newStatus == TransferStatus.Completed)
            await ExecuteTransferAsync(transfer, updatedBy);

        if (newStatus == TransferStatus.Approved)
            transfer.ApprovedBy = updatedBy;

        if (dto.Notes is not null) transfer.Notes = dto.Notes;
        transfer.Status = newStatus;
        transfer.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    private async Task ExecuteTransferAsync(StockTransfer transfer, Guid executedBy)
    {
        foreach (var item in transfer.Items)
        {
            // Deduct from source
            var srcInv = await _db.Inventories
                .FirstOrDefaultAsync(i => i.FacilityId == transfer.SourceFacilityId && i.ProductId == item.ProductId);

            if (srcInv is null)
                throw new InvalidOperationException($"Product not found in source facility inventory.");

            if (srcInv.CurrentStock < item.Quantity)
                throw new InvalidOperationException($"Insufficient stock in source facility for product {item.ProductId}. Available: {srcInv.CurrentStock}, Requested: {item.Quantity}.");

            var srcPrev = srcInv.CurrentStock;
            srcInv.CurrentStock -= item.Quantity;
            srcInv.LastUpdated = DateTime.UtcNow;

            _db.StockLedger.Add(new StockLedger
            {
                InventoryId = srcInv.Id,
                FacilityId = srcInv.FacilityId,
                ProductId = srcInv.ProductId,
                PreviousStock = srcPrev,
                NewStock = srcInv.CurrentStock,
                ChangeAmount = -item.Quantity,
                ChangeType = "Subtract",
                Reason = $"Transfer out: {transfer.TransferNumber}",
                ChangedBy = executedBy,
                ChangedAt = DateTime.UtcNow
            });

            // Add to destination
            var dstInv = await _db.Inventories
                .FirstOrDefaultAsync(i => i.FacilityId == transfer.DestinationFacilityId && i.ProductId == item.ProductId);

            int dstPrev = 0;
            if (dstInv is not null)
            {
                dstPrev = dstInv.CurrentStock;
                dstInv.CurrentStock += item.Quantity;
                if (item.BatchNumber is not null) dstInv.BatchNumber = item.BatchNumber;
                if (item.ExpiryDate.HasValue) dstInv.ExpiryDate = item.ExpiryDate;
                dstInv.LastUpdated = DateTime.UtcNow;
            }
            else
            {
                dstInv = new Inventory
                {
                    FacilityId = transfer.DestinationFacilityId,
                    ProductId = item.ProductId,
                    CurrentStock = item.Quantity,
                    ReorderLevel = 0,
                    BatchNumber = item.BatchNumber,
                    ExpiryDate = item.ExpiryDate
                };
                _db.Inventories.Add(dstInv);
                await _db.SaveChangesAsync();
            }

            _db.StockLedger.Add(new StockLedger
            {
                InventoryId = dstInv.Id,
                FacilityId = dstInv.FacilityId,
                ProductId = dstInv.ProductId,
                PreviousStock = dstPrev,
                NewStock = dstPrev + item.Quantity,
                ChangeAmount = item.Quantity,
                ChangeType = "Add",
                Reason = $"Transfer in: {transfer.TransferNumber}",
                ChangedBy = executedBy,
                ChangedAt = DateTime.UtcNow
            });
        }
    }

    private static StockTransferDto ToDto(StockTransfer t) => new()
    {
        Id = t.Id,
        TransferNumber = t.TransferNumber,
        SourceFacilityId = t.SourceFacilityId,
        SourceFacilityName = t.SourceFacility?.Name ?? string.Empty,
        DestinationFacilityId = t.DestinationFacilityId,
        DestinationFacilityName = t.DestinationFacility?.Name ?? string.Empty,
        Status = t.Status.ToString(),
        Notes = t.Notes,
        CreatedAt = t.CreatedAt,
        UpdatedAt = t.UpdatedAt,
        Items = t.Items.Select(i => new StockTransferItemDto
        {
            Id = i.Id,
            ProductId = i.ProductId,
            ProductName = i.Product?.Name ?? string.Empty,
            ProductUnit = i.Product?.Unit ?? string.Empty,
            Quantity = i.Quantity,
            BatchNumber = i.BatchNumber,
            ExpiryDate = i.ExpiryDate,
            Notes = i.Notes
        }).ToList()
    };
}
