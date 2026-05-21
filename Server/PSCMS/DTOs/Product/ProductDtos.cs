using System.ComponentModel.DataAnnotations;

namespace PSCMS.DTOs.Product;

public class ProductDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string GenericName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string DosageForm { get; set; } = string.Empty;
    public string Strength { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public int MinimumStockLevel { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateProductDto
{
    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string GenericName { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Category { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string DosageForm { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string Strength { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string Unit { get; set; } = string.Empty;

    [Range(0, 1_000_000)]
    public int MinimumStockLevel { get; set; }

    [MaxLength(1000)]
    public string? Description { get; set; }
}

public class UpdateProductDto
{
    public string? Name { get; set; }
    public string? GenericName { get; set; }
    public string? Category { get; set; }
    public string? DosageForm { get; set; }
    public string? Strength { get; set; }
    public string? Unit { get; set; }
    public int? MinimumStockLevel { get; set; }
    public string? Description { get; set; }
    public bool? IsActive { get; set; }
}
