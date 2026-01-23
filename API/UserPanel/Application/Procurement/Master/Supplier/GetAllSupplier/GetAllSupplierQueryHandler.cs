using Core.Master.Supplier;
using Core.OrderMngMaster.Customer;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Master.Supplier.GetAllSupplier
{
    public class GetAllSupplierQueryHandler : IRequestHandler<GetAllSupplierQuery, object>
    {
        private readonly ISupplierMasterRepository _repository;

        public GetAllSupplierQueryHandler(ISupplierMasterRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetAllSupplierQuery request, CancellationToken cancellationToken)
        {
            return await _repository.GetAllAsync(request.branchid ,request.orgid, request.supplierid, request.cityid, request.stateid,request.suppliercategoryid);
        }
    }
}
