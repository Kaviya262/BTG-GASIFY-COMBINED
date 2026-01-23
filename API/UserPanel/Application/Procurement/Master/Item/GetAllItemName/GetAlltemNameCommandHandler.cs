using Application.Procurement.Master.Item.GetAllItemGroup;
using Core.Master.Item;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Master.Item.GetAllItemName
{
    internal class GetAlltemNameCommandHandler : IRequestHandler<GetAlltemNameCommand, object>
    {
        private readonly IItemMasterRepository _repository;

        public GetAlltemNameCommandHandler(IItemMasterRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetAlltemNameCommand request, CancellationToken cancellationToken)
        {
            return await _repository.GetItemNameList(request.branchid, request.orgid);
        }
    }
}