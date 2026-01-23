using Application.Procurement.Master.Supplier.GetAllTax;
using Core.Master.Supplier;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Master.Supplier.GetAllDeliveryTerms
{
    public class GetAllDeliveryTermsCommandHandler : IRequestHandler<GetAllDeliveryTermsCommand, object>
    {
        private readonly ISupplierMasterRepository _repository;

        public GetAllDeliveryTermsCommandHandler(ISupplierMasterRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetAllDeliveryTermsCommand request, CancellationToken cancellationToken)
        {
            return await _repository.GetAllDeliveryTerms(request.branchid, request.orgid);
        }
    }
}
