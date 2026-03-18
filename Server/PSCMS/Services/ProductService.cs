using Microsoft.EntityFrameworkCore;
using PSCMS.Common;
using PSCMS.Data;
using PSCMS.DTOs.Product;
using PSCMS.Models;
using PSCMS.Services.Interfaces;

namespace PSCMS.Services;

public class ProductService : IProductService
{
    private readonly AppDbContext _db;

    public ProductService(AppDbContext db) => _db = db;

    public async Task<PagedResult<ProductDto>> GetAllAsync(int page, int pageSize, string? search)
    {
        var query = _db.Products.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(p => p.Name.Contains(search) || p.GenericName.Contains(search) || p.Category.Contains(search));

        var total = await query.CountAsync();
        var items = await query
            .OrderBy(p => p.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => ToDto(p))
            .ToListAsync();

        return new PagedResult<ProductDto> { Items = items, TotalCount = total, Page = page, PageSize = pageSize };
    }

    public async Task<ProductDto?> GetByIdAsync(Guid id)
    {
        var p = await _db.Products.FindAsync(id);
        return p is null ? null : ToDto(p);
    }

    public async Task<ProductDto> CreateAsync(CreateProductDto dto)
    {
        var product = new Product
        {
            Name = dto.Name,
            GenericName = dto.GenericName,
            Category = dto.Category,
            DosageForm = dto.DosageForm,
            Strength = dto.Strength,
            Unit = dto.Unit,
            MinimumStockLevel = dto.MinimumStockLevel,
            Description = dto.Description
        };
        _db.Products.Add(product);
        await _db.SaveChangesAsync();
        return ToDto(product);
    }

    public async Task<ProductDto?> UpdateAsync(Guid id, UpdateProductDto dto)
    {
        var product = await _db.Products.FindAsync(id);
        if (product is null) return null;

        if (dto.Name is not null) product.Name = dto.Name;
        if (dto.GenericName is not null) product.GenericName = dto.GenericName;
        if (dto.Category is not null) product.Category = dto.Category;
        if (dto.DosageForm is not null) product.DosageForm = dto.DosageForm;
        if (dto.Strength is not null) product.Strength = dto.Strength;
        if (dto.Unit is not null) product.Unit = dto.Unit;
        if (dto.MinimumStockLevel.HasValue) product.MinimumStockLevel = dto.MinimumStockLevel.Value;
        if (dto.Description is not null) product.Description = dto.Description;
        if (dto.IsActive.HasValue) product.IsActive = dto.IsActive.Value;
        product.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return ToDto(product);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var product = await _db.Products.FindAsync(id);
        if (product is null) return false;
        product.IsActive = false;
        product.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return true;
    }

    private static ProductDto ToDto(Product p) => new()
    {
        Id = p.Id,
        Name = p.Name,
        GenericName = p.GenericName,
        Category = p.Category,
        DosageForm = p.DosageForm,
        Strength = p.Strength,
        Unit = p.Unit,
        MinimumStockLevel = p.MinimumStockLevel,
        Description = p.Description,
        IsActive = p.IsActive,
        CreatedAt = p.CreatedAt
    };
}
