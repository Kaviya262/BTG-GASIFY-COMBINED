using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;
using Core.Procurement.Approval;

namespace Application.Procurement.RequisitionApproval.GetAll
{
    public class GetAllApproveRequisitionCommandHandler : IRequestHandler<GetAllApproveRequisitionCommand, object>
    {
        private readonly IRequisitionApprovalRepository _repository;
        public GetAllApproveRequisitionCommandHandler(IRequisitionApprovalRepository repository)
        {

            _repository = repository;

        }
        public async Task<object> Handle(GetAllApproveRequisitionCommand command, CancellationToken cancellationToken)
        {
            return command.Opt switch
            {
                1 => await _repository.GetAllAsync(command.id, command.BranchId, command.OrgId, command.userid),
                
            };
        }
    }
}
