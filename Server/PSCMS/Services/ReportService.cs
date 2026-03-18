using Microsoft.EntityFrameworkCore;
using PSCMS.Data;
using PSCMS.DTOs.Report;
using PSCMS.Models;
using PSCMS.Services.Interfaces;

namespace PSCMS.Services;

public class ReportService : IReportService
{
    private readonly AppDbContext _db;

    public ReportService(AppDbContext db) => _db = db;

    public async Task<DashboardSummaryDto> GetDashboardSummaryAsync()
    {
        var nearExpiryThreshold = DateTime.UtcNow.AddDays(90);

        var totalFacilities = await _db.Facilities.CountAsync(f => f.IsActive);
        var totalProducts = await _db.Products.CountAsync(p => p.IsActive);
        var pendingOrders = await _db.Orders.CountAsync(o => o.Status == OrderStatus.Pending);
        var activeShipments = await _db.Shipments.CountAsync(s => s.Status == ShipmentStatus.InTransit || s.Status == ShipmentStatus.Prepared);
        var lowStock = await _db.Inventories.CountAsync(i => i.CurrentStock <= i.ReorderLevel);
        var nearExpiry = await _db.Inventories.CountAsync(i => i.ExpiryDate.HasValue && i.ExpiryDate.Value <= nearExpiryThreshold);

        var facilitySummaries = await _db.Facilities
            .Where(f => f.IsActive)
            .Select(f => new FacilityStockSummaryDto
            {
                FacilityId = f.Id,
                FacilityName = f.Name,
                TotalProducts = f.Inventories.Count,
                LowStockCount = f.Inventories.Count(i => i.CurrentStock <= i.ReorderLevel),
                OutOfStockCount = f.Inventories.Count(i => i.CurrentStock == 0),
                NearExpiryCount = f.Inventories.Count(i => i.ExpiryDate.HasValue && i.ExpiryDate.Value <= nearExpiryThreshold)
            })
            .ToListAsync();

        return new DashboardSummaryDto
        {
            TotalFacilities = totalFacilities,
            TotalProducts = totalProducts,
            PendingOrders = pendingOrders,
            ActiveShipments = activeShipments,
            LowStockAlerts = lowStock,
            NearExpiryAlerts = nearExpiry,
            FacilitySummaries = facilitySummaries
        };
    }

    public async Task<StockReportDto> GetStockReportAsync(Guid facilityId)
    {
        var facility = await _db.Facilities.FindAsync(facilityId)
            ?? throw new InvalidOperationException("Facility not found.");

        var items = await _db.Inventories
            .Include(i => i.Product)
            .Where(i => i.FacilityId == facilityId)
            .OrderBy(i => i.Product.Category).ThenBy(i => i.Product.Name)
            .Select(i => new StockReportItemDto
            {
                ProductName = i.Product.Name,
                GenericName = i.Product.GenericName,
                Category = i.Product.Category,
                Unit = i.Product.Unit,
                CurrentStock = i.CurrentStock,
                ReorderLevel = i.ReorderLevel,
                MinimumStockLevel = i.Product.MinimumStockLevel,
                StockStatus = i.CurrentStock == 0 ? "Out of Stock"
                    : i.CurrentStock <= i.ReorderLevel ? "Low Stock" : "Adequate",
                ExpiryDate = i.ExpiryDate
            })
            .ToListAsync();

        return new StockReportDto
        {
            FacilityId = facilityId,
            FacilityName = facility.Name,
            FacilityRegion = facility.Region,
            ReportDate = DateTime.UtcNow,
            Items = items
        };
    }

    public async Task<OrderReportDto> GetOrderReportAsync(DateTime from, DateTime to, Guid? facilityId)
    {
        var query = _db.Orders
            .Include(o => o.Facility)
            .Include(o => o.OrderItems)
            .Where(o => o.OrderDate >= from && o.OrderDate <= to);

        if (facilityId.HasValue) query = query.Where(o => o.FacilityId == facilityId);

        var orders = await query.OrderByDescending(o => o.OrderDate).ToListAsync();

        return new OrderReportDto
        {
            FromDate = from,
            ToDate = to,
            TotalOrders = orders.Count,
            PendingOrders = orders.Count(o => o.Status == OrderStatus.Pending),
            ApprovedOrders = orders.Count(o => o.Status == OrderStatus.Approved),
            RejectedOrders = orders.Count(o => o.Status == OrderStatus.Rejected),
            FulfilledOrders = orders.Count(o => o.Status == OrderStatus.Fulfilled),
            Orders = orders.Select(o => new OrderSummaryDto
            {
                OrderNumber = o.OrderNumber,
                FacilityName = o.Facility?.Name ?? string.Empty,
                Status = o.Status.ToString(),
                OrderDate = o.OrderDate,
                TotalItems = o.OrderItems.Count
            }).ToList()
        };
    }
}
