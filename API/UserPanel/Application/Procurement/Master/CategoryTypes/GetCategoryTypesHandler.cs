using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Procurement.Master.ClaimDescription;
using Application.Procurement.Master.Item.GetAllItem;
using Core.Master.Claim;
using MediatR;

namespace Application.Procurement.Master.CategoryTypes
{
    public class GetCategoryTypesHandler : IRequestHandler<GetCategoryTypesQuery, object>
    {
        private readonly IClaimDescriptionRepository _repository;

        public GetCategoryTypesHandler(IClaimDescriptionRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(GetCategoryTypesQuery request, CancellationToken cancellationToken)
        {
            return await _repository.GetAllCategorytypes(request.branchid, request.orgid, request.typeid);
        }
    }
}
