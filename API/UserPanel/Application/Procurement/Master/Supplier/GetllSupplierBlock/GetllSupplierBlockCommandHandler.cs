using Application.Procurement.Master.Supplier.GetAllSupplierCategory;
using Core.Master.Supplier;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Master.Supplier.GetllSupplierBlock
{
    public class GetllSupplierBlockCommandHandler : IRequestHandler<GetllSupplierBlockCommand, object>
    {
        private readonly ISupplierMasterRepository _repository;

        public GetllSupplierBlockCommandHandler(ISupplierMasterRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetllSupplierBlockCommand request, CancellationToken cancellationToken)
        {
            return await _repository.GetSupplierBlockList(request.branchid, request.orgid);
        }
    }
}
