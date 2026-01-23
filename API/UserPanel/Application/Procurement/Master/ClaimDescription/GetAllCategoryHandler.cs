using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Procurement.Master.Item.GetAllItem;
using Core.Master.Claim;
using MediatR;

namespace Application.Procurement.Master.ClaimDescription
{
    public class GetAllCategoryHandler : IRequestHandler<GetAllCategoryQuery, object>
    {
        private readonly IClaimDescriptionRepository _repository;

        public GetAllCategoryHandler(IClaimDescriptionRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(GetAllCategoryQuery request, CancellationToken cancellationToken)
        {
            return await _repository.GetAllCategory(request.branchid, request.orgid);
        }
    }
}
