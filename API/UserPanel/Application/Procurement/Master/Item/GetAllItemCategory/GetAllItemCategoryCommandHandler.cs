using Application.Procurement.Master.Item.GetAllItem;
using Core.Master.Item;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Master.Item.GetAllItemCategory
{
    public class GetAllItemCategoryCommandHandler : IRequestHandler<GetAllItemCategoryCommand,object>
    {
        private readonly IItemMasterRepository _repository;

        public GetAllItemCategoryCommandHandler(IItemMasterRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetAllItemCategoryCommand request, CancellationToken cancellationToken)
        {
            return await _repository.GetItemCategoryList(request.branchid, request.orgid);
        }
    }
}
