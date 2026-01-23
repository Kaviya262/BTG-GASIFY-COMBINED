using Application.Procurement.Master.Item.GetAllItemCode;
using Core.Master.Item;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Master.Item.GetAllItemGroup
{
    public class GetAllItemGroupCommandHandler : IRequestHandler<GetAllItemGroupCommand, object>
    {
        private readonly IItemMasterRepository _repository;

        public GetAllItemGroupCommandHandler(IItemMasterRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetAllItemGroupCommand request, CancellationToken cancellationToken)
        {
            return await _repository.GetItemGroupList(request.branchid, request.orgid);
        }
    }
}