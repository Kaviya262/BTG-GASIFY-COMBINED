using Application.Procurement.Master.Supplier.GetAllCity;
using Core.Master.Supplier;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Master.Supplier.GetAllCountry
{
    public class GetAllCountryCommandHandler : IRequestHandler<GetAllCountryCommand, object>
    {
        private readonly ISupplierMasterRepository _repository;

        public GetAllCountryCommandHandler(ISupplierMasterRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetAllCountryCommand request, CancellationToken cancellationToken)
        {
            return await _repository.GetCountryList(request.branchid, request.orgid);
        }
    
    }
}
