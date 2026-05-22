namespace PSCMS.Models;

public class GoodsReceiptNoteItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid GrnId { get; set; }
    public GoodsReceiptNote GoodsReceiptNote { get; set; } = null!;
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int ExpectedQuantity { get; set; }
    public int ReceivedQuantity { get; set; }
    public string Condition { get; set; } = "Good"; // Good | Damaged | Expired
    public string? BatchNumber { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? Notes { get; set; }
}
