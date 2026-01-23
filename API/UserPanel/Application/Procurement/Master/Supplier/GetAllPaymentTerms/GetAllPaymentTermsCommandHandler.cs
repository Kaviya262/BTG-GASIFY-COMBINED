using Application.Procurement.Master.Supplier.GetAllDeliveryTerms;
using Core.Master.Supplier;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Master.Supplier.GetAllPaymentTerms
{
    public  class GetAllPaymentTermsCommandHandler : IRequestHandler<GetAllPaymentTermsCommand, object>
    {
        private readonly ISupplierMasterRepository _repository;

        public GetAllPaymentTermsCommandHandler(ISupplierMasterRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetAllPaymentTermsCommand request, CancellationToken cancellationToken)
        {
            return await _repository.GetAllPaymentTerms(request.branchid, request.orgid);
        }
    }
}
