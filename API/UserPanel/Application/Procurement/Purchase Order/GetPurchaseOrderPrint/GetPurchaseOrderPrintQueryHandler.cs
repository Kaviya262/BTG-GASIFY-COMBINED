using Application.Procurement.Purchase_Order.GetPurchaseOrderSeqNo;
using Core.Procurement.PurchaseOrder;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Purchase_Order.GetPurchaseOrderPrint
{
    public class GetPurchaseOrderPrintQueryHandler : IRequestHandler<GetPurchaseOrderPrintQuery, object>
    {
        private readonly IPurchaseOrderRepository _repository;

        public GetPurchaseOrderPrintQueryHandler(IPurchaseOrderRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(GetPurchaseOrderPrintQuery command, CancellationToken cancellationToken)
        {
            var Result = await _repository.GetPurchaseorderPrint(command.opt, command.poid, command.branchid, command.orgid);
            return Result;
        }

    }
}
