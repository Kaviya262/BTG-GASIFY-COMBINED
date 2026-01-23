using Application.Procurement.Master.Item.GetAllItemCategory;
using Core.Master.Item;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Master.Item.GetAllItemCode
{
    public class GetAllItemCodeCommandHandler : IRequestHandler<GetAllItemCodeCommand, object>
    {
        private readonly IItemMasterRepository _repository;

        public GetAllItemCodeCommandHandler(IItemMasterRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetAllItemCodeCommand request, CancellationToken cancellationToken)
        {
            return await _repository.GetItemCodeList(request.branchid, request.orgid);
        }
    }
}