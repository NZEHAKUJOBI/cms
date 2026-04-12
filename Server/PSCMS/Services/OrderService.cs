using Microsoft.EntityFrameworkCore;
using PSCMS.Common;
using PSCMS.Data;
using PSCMS.DTOs.Order;
using PSCMS.Models;
using PSCMS.Services.Interfaces;

namespace PSCMS.Services;

public class OrderService : IOrderService
{
    private readonly AppDbContext _db;

    public OrderService(AppDbContext db) => _db = db;

    public async Task<PagedResult<OrderDto>> GetAllAsync(int page, int pageSize, Guid? facilityId, string? status)
    {
        var query = _db.Orders
            .Include(o => o.Facility)
            .Include(o => o.OrderItems).ThenInclude(oi => oi.Product)
            .AsQueryable();

        if (facilityId.HasValue) query = query.Where(o => o.FacilityId == facilityId);
        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<OrderStatus>(status, out var s))
            query = query.Where(o => o.Status == s);

        var total = await query.CountAsync();
        var items = (await query
            .OrderByDescending(o => o.OrderDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync())
            .Select(ToDto).ToList();

        return new PagedResult<OrderDto> { Items = items, TotalCount = total, Page = page, PageSize = pageSize };
    }

    public async Task<OrderDto?> GetByIdAsync(Guid id)
    {
        var order = await _db.Orders
            .Include(o => o.Facility)
            .Include(o => o.OrderItems).ThenInclude(oi => oi.Product)
            .FirstOrDefaultAsync(o => o.Id == id);
        return order is null ? null : ToDto(order);
    }

    public async Task<OrderDto> CreateAsync(CreateOrderDto dto, Guid requestedBy)
    {
        var orderNumber = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";

        var order = new Order
        {
            OrderNumber = orderNumber,
            FacilityId = dto.FacilityId,
            RequiredDate = dto.RequiredDate.HasValue
                ? DateTime.SpecifyKind(dto.RequiredDate.Value, DateTimeKind.Utc)
                : null,
            Notes = dto.Notes,
            RequestedBy = requestedBy,
            OrderItems = dto.OrderItems.Select(i => new OrderItem
            {
                ProductId = i.ProductId,
                RequestedQuantity = i.RequestedQuantity,
                Notes = i.Notes
            }).ToList()
        };

        _db.Orders.Add(order);
        await _db.SaveChangesAsync();
        return (await GetByIdAsync(order.Id))!;
    }

    public async Task<OrderDto?> ApproveAsync(Guid id, ApproveOrderDto dto, Guid approvedBy)
    {
        var order = await _db.Orders
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order is null || order.Status != OrderStatus.Pending) return null;

        foreach (var item in dto.Items)
        {
            var oi = order.OrderItems.FirstOrDefault(x => x.Id == item.OrderItemId);
            if (oi is not null) oi.ApprovedQuantity = item.ApprovedQuantity;
        }

        order.Status = OrderStatus.Approved;
        order.ApprovedBy = approvedBy;
        order.ApprovedAt = DateTime.UtcNow;
        if (dto.Notes is not null) order.Notes = dto.Notes;
        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task<OrderDto?> RejectAsync(Guid id, RejectOrderDto dto, Guid rejectedBy)
    {
        var order = await _db.Orders.FindAsync(id);
        if (order is null || order.Status != OrderStatus.Pending) return null;

        order.Status = OrderStatus.Rejected;
        order.RejectionReason = dto.Reason;
        order.ApprovedBy = rejectedBy;
        order.ApprovedAt = DateTime.UtcNow;
        order.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task<bool> CancelAsync(Guid id, Guid requestedBy)
    {
        var order = await _db.Orders.FindAsync(id);
        if (order is null || order.Status == OrderStatus.Dispatched || order.Status == OrderStatus.Fulfilled)
            return false;

        order.Status = OrderStatus.Cancelled;
        order.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return true;
    }

    private static OrderDto ToDto(Order o) => new()
    {
        Id = o.Id,
        OrderNumber = o.OrderNumber,
        FacilityId = o.FacilityId,
        FacilityName = o.Facility?.Name ?? string.Empty,
        Status = o.Status.ToString(),
        OrderDate = o.OrderDate,
        RequiredDate = o.RequiredDate,
        Notes = o.Notes,
        RejectionReason = o.RejectionReason,
        ApprovedAt = o.ApprovedAt,
        CreatedAt = o.CreatedAt,
        OrderItems = o.OrderItems.Select(oi => new OrderItemDto
        {
            Id = oi.Id,
            ProductId = oi.ProductId,
            ProductName = oi.Product?.Name ?? string.Empty,
            ProductUnit = oi.Product?.Unit ?? string.Empty,
            RequestedQuantity = oi.RequestedQuantity,
            ApprovedQuantity = oi.ApprovedQuantity,
            Notes = oi.Notes
        }).ToList()
    };
}
