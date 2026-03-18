namespace PSCMS.DTOs.Order;

public class OrderDto
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public Guid FacilityId { get; set; }
    public string FacilityName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; }
    public DateTime? RequiredDate { get; set; }
    public string? Notes { get; set; }
    public string? RejectionReason { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public List<OrderItemDto> OrderItems { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}

public class OrderItemDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductUnit { get; set; } = string.Empty;
    public int RequestedQuantity { get; set; }
    public int? ApprovedQuantity { get; set; }
    public string? Notes { get; set; }
}

public class CreateOrderDto
{
    public Guid FacilityId { get; set; }
    public DateTime? RequiredDate { get; set; }
    public string? Notes { get; set; }
    public List<CreateOrderItemDto> OrderItems { get; set; } = new();
}

public class CreateOrderItemDto
{
    public Guid ProductId { get; set; }
    public int RequestedQuantity { get; set; }
    public string? Notes { get; set; }
}

public class ApproveOrderDto
{
    public List<ApproveOrderItemDto> Items { get; set; } = new();
    public string? Notes { get; set; }
}

public class ApproveOrderItemDto
{
    public Guid OrderItemId { get; set; }
    public int ApprovedQuantity { get; set; }
}

public class RejectOrderDto
{
    public string Reason { get; set; } = string.Empty;
}
