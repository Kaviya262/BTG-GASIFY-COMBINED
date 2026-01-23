using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Procurement.Master.GetAllPaymentDescription;
using Core.Master.Claim;
using MediatR;

namespace Application.Procurement.Master.SearchbyCategory
{
    public class GetClaimtypeidCommandHandler: IRequestHandler<GetClaimtypeidCommand,object>
    {
        private readonly IClaimDescriptionRepository _repository;
        public GetClaimtypeidCommandHandler(IClaimDescriptionRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(GetClaimtypeidCommand request, CancellationToken cancellationToken)
        {
            return await _repository.searchbyCategory(request.branchid, request.orgid, request.categoryid,request.claimtypeid);
        }
    }
}
