using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PSCMS.Common;
using PSCMS.Data;
using PSCMS.DTOs.Auth;
using PSCMS.Models;
using System.Security.Claims;

namespace PSCMS.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly AppDbContext _db;

    public NotificationsController(AppDbContext db) => _db = db;

    /// <summary>Aggregated in-app notifications for the current user.</summary>
    [HttpGet]
    public async Task<IActionResult> GetNotifications()
    {
        var role = User.FindFirstValue(ClaimTypes.Role);
        var facilityIdStr = User.FindFirstValue("facilityId");
        Guid.TryParse(facilityIdStr, out var facilityId);
        var isAdmin = role == "Admin";

        var notifications = new List<NotificationDto>();
        var now = DateTime.UtcNow;

        // --- Pending orders ---
        var pendingOrdersQ = _db.Orders.Where(o => o.Status == OrderStatus.Pending);
        if (!isAdmin && facilityId != Guid.Empty)
            pendingOrdersQ = pendingOrdersQ.Where(o => o.FacilityId == facilityId);
        var pendingCount = await pendingOrdersQ.CountAsync();
        if (pendingCount > 0)
            notifications.Add(new NotificationDto
            {
                Type = "order",
                Title = "Pending Orders",
                Message = $"{pendingCount} order{(pendingCount == 1 ? "" : "s")} awaiting approval.",
                CreatedAt = now
            });

        // --- Low stock ---
        var lowStockQ = _db.Inventories.Where(i => i.CurrentStock <= i.ReorderLevel);
        if (!isAdmin && facilityId != Guid.Empty)
            lowStockQ = lowStockQ.Where(i => i.FacilityId == facilityId);
        var lowStockCount = await lowStockQ.CountAsync();
        if (lowStockCount > 0)
            notifications.Add(new NotificationDto
            {
                Type = "stock",
                Title = "Low Stock Alert",
                Message = $"{lowStockCount} item{(lowStockCount == 1 ? "" : "s")} below reorder level.",
                CreatedAt = now
            });

        // --- Near-expiry (within 30 days) ---
        var expiryThreshold = now.AddDays(30);
        var nearExpiryQ = _db.Inventories.Where(i => i.ExpiryDate.HasValue && i.ExpiryDate <= expiryThreshold && i.ExpiryDate >= now);
        if (!isAdmin && facilityId != Guid.Empty)
            nearExpiryQ = nearExpiryQ.Where(i => i.FacilityId == facilityId);
        var nearExpiryCount = await nearExpiryQ.CountAsync();
        if (nearExpiryCount > 0)
            notifications.Add(new NotificationDto
            {
                Type = "expiry",
                Title = "Expiring Soon",
                Message = $"{nearExpiryCount} item{(nearExpiryCount == 1 ? "" : "s")} expire within 30 days.",
                CreatedAt = now
            });

        // --- Recent shipment updates (last 24h) ---
        var since = now.AddHours(-24);
        var recentShipmentsQ = _db.Shipments.Where(s => s.UpdatedAt >= since);
        if (!isAdmin && facilityId != Guid.Empty)
            recentShipmentsQ = recentShipmentsQ.Where(s => s.FacilityId == facilityId);
        var recentShipCount = await recentShipmentsQ.CountAsync();
        if (recentShipCount > 0)
            notifications.Add(new NotificationDto
            {
                Type = "shipment",
                Title = "Shipment Updates",
                Message = $"{recentShipCount} shipment{(recentShipCount == 1 ? "" : "s")} updated in the last 24 hours.",
                CreatedAt = now
            });

        return Ok(ApiResponse<List<NotificationDto>>.Ok(notifications));
    }
}
