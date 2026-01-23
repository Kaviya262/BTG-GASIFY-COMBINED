using Application.Procurement.Purchase_Requitision.GetSupplierAutoComplete;
using Core.Procurement.PurchaseRequisition;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Purchase_Requitision.GetSupplierCurrency
{
    public class GetSupplierCurrencyQueryHandler : IRequestHandler<GetSupplierCurrencyQuery , object>
    {
        private readonly IPurchaseRequisitionRepository _repository;

        public GetSupplierCurrencyQueryHandler(IPurchaseRequisitionRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetSupplierCurrencyQuery command, CancellationToken cancellationToken)
        {

            var Result = await _repository.GetSupplierCurrency(command.supplierid,command.orgid);
            return Result;

        }
    }
}
