using Application.Procurement.Master.Supplier.GetAllSupplierCategory;
using Core.Master.Supplier;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Master.Supplier.GetAllTax
{
    public class GetAllTaxListCommandHandler : IRequestHandler<GetAllTaxListCommand, object>
    {
        private readonly ISupplierMasterRepository _repository;

        public GetAllTaxListCommandHandler(ISupplierMasterRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetAllTaxListCommand request, CancellationToken cancellationToken)
        {
            return await _repository.GetAllTaxList(request.branchid, request.orgid);
        }
    }
}
