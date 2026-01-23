using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Finance.ClaimAndPayment.GetList;
using Application.Finance.ClaimApproval.GetAll;
using Application.Finance.ClaimApproval.GetHistory;
using Core.Finance.Approval;
using Core.Finance.ClaimAndPayment;
using Core.OrderMng.Invoices;
using Core.OrderMng.SaleOrder;
using Core.Procurement.PurchaseMemo;
using MediatR;
using UserPanel.Application.Order.GetAllOrderItems;

namespace Application.Finance.ClaimAndPayment.GetHistory
{
    public class GetHistoryApproveCommandHandler : IRequestHandler<GetHistoryApproveCommand, object>
    {
        private readonly IClaimApprovalRepository _repository;


        public GetHistoryApproveCommandHandler(IClaimApprovalRepository repository)
        {

            _repository = repository;

        }
        public async Task<object> Handle(GetHistoryApproveCommand command, CancellationToken cancellationToken)
        {

            var Result = await _repository.GetHistoryAsync(command.id, command.userid, command.BranchId,command.OrgId,command.fromdate,command.todate);
            return Result;

        }
    }
}

