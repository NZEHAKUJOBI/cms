using System.ComponentModel.DataAnnotations;

namespace PSCMS.DTOs.GRN;

public class GrnDto
{
    public Guid Id { get; set; }
    public string GrnNumber { get; set; } = string.Empty;
    public Guid ShipmentId { get; set; }
    public string ShipmentNumber { get; set; } = string.Empty;
    public Guid FacilityId { get; set; }
    public string FacilityName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? OverallNotes { get; set; }
    public DateTime InspectedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<GrnItemDto> Items { get; set; } = new();
}

public class GrnItemDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductUnit { get; set; } = string.Empty;
    public int ExpectedQuantity { get; set; }
    public int ReceivedQuantity { get; set; }
    public string Condition { get; set; } = "Good";
    public string? BatchNumber { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? Notes { get; set; }
}

public class SubmitGrnDto
{
    [MaxLength(1000)]
    public string? OverallNotes { get; set; }

    [Required, MinLength(1, ErrorMessage = "At least one item is required.")]
    public List<SubmitGrnItemDto> Items { get; set; } = new();
}

public class SubmitGrnItemDto
{
    [Required]
    public Guid ProductId { get; set; }

    public int ExpectedQuantity { get; set; }

    [Range(0, 10_000_000)]
    public int ReceivedQuantity { get; set; }

    [Required, RegularExpression("^(Good|Damaged|Expired)$", ErrorMessage = "Condition must be Good, Damaged, or Expired.")]
    public string Condition { get; set; } = "Good";

    [MaxLength(100)]
    public string? BatchNumber { get; set; }

    public DateTime? ExpiryDate { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }
}
