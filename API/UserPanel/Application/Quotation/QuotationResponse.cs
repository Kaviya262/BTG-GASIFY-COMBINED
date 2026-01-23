namespace UserPanel.Application.Quotation;

public class QuotationResponse
{
    public int Id { get; set; }
    public string Title { get; set; }
    public DateOnly DueDate { get; set; }
    public bool IsCompleted { get; set; }
    public string Priority { get; set; }
}