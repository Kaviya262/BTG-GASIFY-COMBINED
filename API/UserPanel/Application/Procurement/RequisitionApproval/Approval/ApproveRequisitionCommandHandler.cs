using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;
using Core.Procurement.Approval;
using Core.Procurement.PurchaseRequisition;
using Application.Finance.ClaimApproval.Approval;
using Core.Abstractions;
using Core.Finance.Approval;

namespace Application.Procurement.RequisitionApproval.Approval
{
    public class ApproveRequisitionCommandHandler : IRequestHandler<ApproveRequisitionCommand, object>
    {
        private readonly IRequisitionApprovalRepository _repository;
        private readonly IUnitOfWorkDB1 _unitOfWork;


        public ApproveRequisitionCommandHandler(IRequisitionApprovalRepository repository, IUnitOfWorkDB1 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;

        }

        public async Task<object> Handle(ApproveRequisitionCommand command, CancellationToken cancellationToken)
        {
            RequisitionApprovalHdr obj = new RequisitionApprovalHdr();
            obj = command.Approve;


            var data = await _repository.ApproveAsync(obj);
            _unitOfWork.Commit();
            return data;

        }
    }
}