using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.OrderMng.Invoices;
using Core.OrderMng.SaleOrder;
using Core.Procurement.PurchaseMemo;
using MediatR;

namespace Application.Procurement.Purchase_Memo.GetPurchaseMemoSeqNo
{
    public class GetPurchaseMemoSeqNoQueryHandler : IRequestHandler<GetPurchaseMemoSeqNoQuery, object>
    {
        private readonly IPurchaseMemoRepository _repository;

        public GetPurchaseMemoSeqNoQueryHandler(IPurchaseMemoRepository repository)
        {
            _repository = repository;

        }
        public async Task<object> Handle(GetPurchaseMemoSeqNoQuery command, CancellationToken cancellationToken)
        {
            var Result = await _repository.GetBySeqNoAsync(command.BranchId,command.OrgId);
            return Result;

        }
    }
}
