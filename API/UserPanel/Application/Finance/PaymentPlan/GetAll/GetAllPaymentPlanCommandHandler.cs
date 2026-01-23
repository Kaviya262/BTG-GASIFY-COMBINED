using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Finance.ClaimAndPayment.GetList;
using Application.Finance.ClaimApproval.GetAll;
using Core.Finance.Approval;
using Core.Finance.ClaimAndPayment;
using Core.OrderMng.Invoices;
using Core.OrderMng.SaleOrder;
using Core.Procurement.PurchaseMemo;
using MediatR;
using UserPanel.Application.Order.GetAllOrderItems;

namespace Application.Finance.PaymentPlan.GetList
{
    public class GetAllPaymentPlanCommandHandler : IRequestHandler<GetAllPaymentPlanCommand, object>
    {
        private readonly IClaimApprovalRepository _repository;


        public GetAllPaymentPlanCommandHandler(IClaimApprovalRepository repository)
        {

            _repository = repository;

        }
        public async Task<object> Handle(GetAllPaymentPlanCommand command, CancellationToken cancellationToken)
        {

            var Result = await _repository.GetAllPaymentPlanAsync(command.id, command.BranchId,command.OrgId,command.userid);
            return Result;

        }
    }
}

