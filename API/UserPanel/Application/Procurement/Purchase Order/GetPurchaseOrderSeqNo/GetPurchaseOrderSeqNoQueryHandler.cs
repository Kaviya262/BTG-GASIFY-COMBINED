using Core.Procurement.PurchaseOrder;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Purchase_Order.GetPurchaseOrderSeqNo
{
    public class GetPurchaseOrderSeqNoQueryHandler : IRequestHandler<GetPurchaseOrderSeqNoQuery , object>
    {
       private readonly IPurchaseOrderRepository _repository;

        public GetPurchaseOrderSeqNoQueryHandler(IPurchaseOrderRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(GetPurchaseOrderSeqNoQuery command, CancellationToken cancellationToken)
        {
            var Result = await _repository.GetByPONoSeqAsync(command.branchid, command.orgid);
            return Result;
        }

    }
}
