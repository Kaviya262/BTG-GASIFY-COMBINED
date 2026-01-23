using Core.Procurement.PurchaseRequisition;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Purchase_Requitision.GetAllPO
{
    public class GetAllPOQueryHandler : IRequestHandler<GetAllPOQuery, object>
    {
        private readonly IPurchaseRequisitionRepository _repository;

        public GetAllPOQueryHandler(IPurchaseRequisitionRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetAllPOQuery command, CancellationToken cancellationToken)
        {

            var Result = await _repository.GetAllPO(command.branchid, command.orgid, command.PRId);
            return Result;

        }
    }
}
