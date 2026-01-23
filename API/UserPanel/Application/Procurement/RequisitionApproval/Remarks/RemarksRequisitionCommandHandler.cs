using Application.Finance.ClaimApproval.Remarks;
using Core.Abstractions;
using Core.Finance.Approval;
using Core.Procurement.Approval;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.RequisitionApproval.Remarks
{
    public class RemarksRequisitionCommandHandler : IRequestHandler<RemarksRequisitionCommand, object>
    {
        private readonly IRequisitionApprovalRepository _repository;



        public RemarksRequisitionCommandHandler(IRequisitionApprovalRepository repository)
        {
            _repository = repository;


        }

        public async Task<object> Handle(RemarksRequisitionCommand command, CancellationToken cancellationToken)
        {

            var data = await _repository.GetRemarksList(command.prid);
            return data;
        }
    }
}