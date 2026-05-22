using System.ComponentModel.DataAnnotations;

namespace PSCMS.DTOs.Transfer;

public class StockTransferDto
{
    public Guid Id { get; set; }
    public string TransferNumber { get; set; } = string.Empty;
    public Guid SourceFacilityId { get; set; }
    public string SourceFacilityName { get; set; } = string.Empty;
    public Guid DestinationFacilityId { get; set; }
    public string DestinationFacilityName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<StockTransferItemDto> Items { get; set; } = new();
}

public class StockTransferItemDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductUnit { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string? BatchNumber { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? Notes { get; set; }
}

public class CreateStockTransferDto
{
    [Required]
    public Guid SourceFacilityId { get; set; }

    [Required]
    public Guid DestinationFacilityId { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }

    [Required, MinLength(1, ErrorMessage = "At least one item is required.")]
    public List<CreateStockTransferItemDto> Items { get; set; } = new();
}

public class CreateStockTransferItemDto
{
    [Required]
    public Guid ProductId { get; set; }

    [Range(1, 1_000_000)]
    public int Quantity { get; set; }

    [MaxLength(100)]
    public string? BatchNumber { get; set; }

    public DateTime? ExpiryDate { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }
}

public class UpdateTransferStatusDto
{
    [Required, RegularExpression("^(Approved|InTransit|Completed|Cancelled)$",
        ErrorMessage = "Status must be Approved, InTransit, Completed, or Cancelled.")]
    public string Status { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Notes { get; set; }
}
