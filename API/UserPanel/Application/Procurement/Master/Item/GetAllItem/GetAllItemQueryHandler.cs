using Application.Procurement.Master.Supplier.GetAllSupplier;
using Core.Master.Item;
using Core.Master.Supplier;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Master.Item.GetAllItem
{
    public  class GetAllItemQueryHandler : IRequestHandler<GetAllItemQuery,object>
    {
        private readonly IItemMasterRepository _repository;

        public GetAllItemQueryHandler(IItemMasterRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetAllItemQuery request, CancellationToken cancellationToken)
        {
            return await _repository.GetAllAsync(request.branchid, request.orgid, request.itemid, request.itemcode, request.itemname, request.groupid, request.categoryid);
        }

    }
}
