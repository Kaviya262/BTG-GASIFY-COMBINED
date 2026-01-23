using Application.Procurement.Master.Supplier.GetAllSupplier;
using Core.Master.Supplier;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Master.Supplier.GetAllCity
{
    public class GetAllCityCommandHandler : IRequestHandler<GetAllCityCommand, object>
    {
        private readonly ISupplierMasterRepository _repository;

        public GetAllCityCommandHandler(ISupplierMasterRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetAllCityCommand request, CancellationToken cancellationToken)
        {
            return await _repository.GetCityList(request.branchid, request.orgid);
        }
    }
}
