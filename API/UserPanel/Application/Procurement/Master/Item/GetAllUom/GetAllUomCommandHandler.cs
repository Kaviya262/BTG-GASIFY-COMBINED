using Application.Procurement.Master.Item.GetAllItemName;
using Core.Master.Item;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Master.Item.GetAllUom
{
    public  class GetAllUomCommandHandler : IRequestHandler<GetAllUomCommand, object>
    {
        private readonly IItemMasterRepository _repository;

        public GetAllUomCommandHandler(IItemMasterRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetAllUomCommand request, CancellationToken cancellationToken)
        {
            return await _repository.GetUOMList(request.branchid, request.orgid);
        }
    }
}