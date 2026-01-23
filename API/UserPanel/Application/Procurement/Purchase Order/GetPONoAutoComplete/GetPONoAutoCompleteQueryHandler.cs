using Application.Procurement.Purchase_Order.GetPOSupplierAutoComplete;
using Core.Procurement.PurchaseOrder;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Purchase_Order.GetPONoAutoComplete
{
    public class GetPONoAutoCompleteQueryHandler : IRequestHandler<GetPONoAutoCompleteQuery, object>
    {
        private readonly IPurchaseOrderRepository _repository;

        public GetPONoAutoCompleteQueryHandler(IPurchaseOrderRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetPONoAutoCompleteQuery command, CancellationToken cancellationToken)
        {

            var Result = await _repository.GetPOnoAutoComplete(command.branchid, command.orgid, command.ponumber);
            return Result;

        }
    }
}