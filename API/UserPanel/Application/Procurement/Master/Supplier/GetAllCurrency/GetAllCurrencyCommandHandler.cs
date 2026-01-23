using Application.Procurement.Master.Supplier.GetAllCountry;
using Core.Master.Supplier;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Master.Supplier.GetAllCurrency
{
    public class GetAllCurrencyCommandHandler : IRequestHandler<GetAllCurrencyCommand , object>
    {
        private readonly ISupplierMasterRepository _repository;

        public GetAllCurrencyCommandHandler(ISupplierMasterRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetAllCurrencyCommand request, CancellationToken cancellationToken)
        {
            return await _repository.GetCurrencyList(request.branchid, request.orgid);
        }
    }
}
