using Application.Procurement.Master.Item.GetAllItemCode;
using Core.Master.Item;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Master.Item.ItemCodeSeqId
{
    public class GetItemCodeSeqCommonHandler : IRequestHandler<GetItemCodeSeqCommon, object>
    {
        private readonly IItemMasterRepository _repository;

        public GetItemCodeSeqCommonHandler(IItemMasterRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetItemCodeSeqCommon request, CancellationToken cancellationToken)
        {
            return await _repository.GetItemcodeSeqId(request.branchid, request.orgid);
        }
    }
}
