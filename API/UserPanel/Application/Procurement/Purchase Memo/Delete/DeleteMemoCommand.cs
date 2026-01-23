using Core.Finance.ClaimAndPayment;
using Core.Procurement.PurchaseMemo;
using MediatR;

namespace Application.Procurement.Purchase_Memo.Delete
{
    public class DeleteMemoCommand : IRequest<object>
    {
      public InActiveMemo delete { get; set; }
    }

}
