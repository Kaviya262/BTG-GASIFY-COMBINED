using Application.Procurement.Purchase_Requitision.GetPurchaseRequitisionItem;
using Core.Procurement.PurchaseOrder;
using Core.Procurement.PurchaseRequisition;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Purchase_Order.GetPurchaseOrderItem
{
    public class GetPurchaseOrderByIdQueryHandler : IRequestHandler<GetPurchaseOrderByIdQuery , object>
    {
        private readonly IPurchaseOrderRepository _repository;

        public GetPurchaseOrderByIdQueryHandler(IPurchaseOrderRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(GetPurchaseOrderByIdQuery query, CancellationToken cancellationToken)
        {
            var Result = await _repository.GetByIdAsync(query.poid, query.branchid, query.orgid);
            return Result;

        }
    }
}
