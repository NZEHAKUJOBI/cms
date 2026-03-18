using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PSCMS.Common;
using PSCMS.DTOs.Order;
using PSCMS.Services.Interfaces;
using System.Security.Claims;

namespace PSCMS.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService) => _orderService = orderService;

    /// <summary>Get paginated orders, optionally filtered by facility or status.</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] Guid? facilityId = null,
        [FromQuery] string? status = null)
    {
        var result = await _orderService.GetAllAsync(page, pageSize, facilityId, status);
        return Ok(ApiResponse<PagedResult<OrderDto>>.Ok(result));
    }

    /// <summary>Get an order by ID.</summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var order = await _orderService.GetByIdAsync(id);
        if (order is null) return NotFound(ApiResponse<string>.Fail("Order not found."));
        return Ok(ApiResponse<OrderDto>.Ok(order));
    }

    /// <summary>Submit a new requisition/order from a facility.</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOrderDto dto)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var order = await _orderService.CreateAsync(dto, userId);
        return CreatedAtAction(nameof(GetById), new { id = order.Id }, ApiResponse<OrderDto>.Ok(order, "Order submitted."));
    }

    /// <summary>Approve an order (Admin only).</summary>
    [HttpPost("{id:guid}/approve")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Approve(Guid id, [FromBody] ApproveOrderDto dto)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var order = await _orderService.ApproveAsync(id, dto, userId);
        if (order is null) return BadRequest(ApiResponse<string>.Fail("Order not found or cannot be approved."));
        return Ok(ApiResponse<OrderDto>.Ok(order, "Order approved."));
    }

    /// <summary>Reject an order (Admin only).</summary>
    [HttpPost("{id:guid}/reject")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Reject(Guid id, [FromBody] RejectOrderDto dto)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var order = await _orderService.RejectAsync(id, dto, userId);
        if (order is null) return BadRequest(ApiResponse<string>.Fail("Order not found or cannot be rejected."));
        return Ok(ApiResponse<OrderDto>.Ok(order, "Order rejected."));
    }

    /// <summary>Cancel an order.</summary>
    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var success = await _orderService.CancelAsync(id, userId);
        if (!success) return BadRequest(ApiResponse<string>.Fail("Order cannot be cancelled."));
        return Ok(ApiResponse<string>.Ok("Cancelled.", "Order cancelled."));
    }
}
