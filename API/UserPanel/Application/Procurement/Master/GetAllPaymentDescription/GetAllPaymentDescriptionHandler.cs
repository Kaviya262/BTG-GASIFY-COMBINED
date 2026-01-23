using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Master.Claim;
using MediatR;

namespace Application.Procurement.Master.GetAllPaymentDescription
{
    public class GetAllPaymentDescriptionHandler : IRequestHandler<GetAllPaymentDescriptionCommand, object>
    {
        private readonly IClaimDescriptionRepository _repository;
        public GetAllPaymentDescriptionHandler(IClaimDescriptionRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(GetAllPaymentDescriptionCommand request, CancellationToken cancellationToken)
        {
            return await _repository.GetPaymentDescriptionList(request.branchid, request.orgid);
        }
    }
}
