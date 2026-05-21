using System.ComponentModel.DataAnnotations;

namespace PSCMS.DTOs.Shipment;

public class ShipmentDto
{
    public Guid Id { get; set; }
    public string ShipmentNumber { get; set; } = string.Empty;
    public Guid? OrderId { get; set; }
    public string? OrderNumber { get; set; }
    public Guid FacilityId { get; set; }
    public string FacilityName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime ShipmentDate { get; set; }
    public DateTime? ExpectedDeliveryDate { get; set; }
    public DateTime? ActualDeliveryDate { get; set; }
    public string? Notes { get; set; }
    public List<ShipmentItemDto> ShipmentItems { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}

public class ShipmentItemDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductUnit { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string? BatchNumber { get; set; }
    public DateTime? ExpiryDate { get; set; }
}

public class CreateShipmentDto
{
    public Guid? OrderId { get; set; }

    [Required]
    public Guid FacilityId { get; set; }

    public DateTime? ExpectedDeliveryDate { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }

    [Required, MinLength(1, ErrorMessage = "At least one shipment item is required.")]
    public List<CreateShipmentItemDto> ShipmentItems { get; set; } = new();
}

public class CreateShipmentItemDto
{
    [Required]
    public Guid ProductId { get; set; }

    [Range(1, 1_000_000)]
    public int Quantity { get; set; }

    [MaxLength(100)]
    public string? BatchNumber { get; set; }

    public DateTime? ExpiryDate { get; set; }
}

public class UpdateShipmentStatusDto
{
    [Required, MaxLength(50)]
    public string Status { get; set; } = string.Empty;

    public DateTime? ActualDeliveryDate { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }
}
