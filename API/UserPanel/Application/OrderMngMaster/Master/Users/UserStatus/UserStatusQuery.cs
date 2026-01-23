using MediatR;

public class UserStatusQuery : IRequest<object>
{
    public int UserId { get; set; }
    public string? Remark { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public int BranchId { get; set; }
}