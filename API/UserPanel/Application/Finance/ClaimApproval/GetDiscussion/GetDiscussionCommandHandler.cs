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
using DocumentFormat.OpenXml.Spreadsheet;
using MediatR;
using MySqlX.XDevAPI.Common;
using UserPanel.Application.Order.GetAllOrderItems;

namespace Application.Finance.ClaimAndPayment.GetList
{
    public class GetDiscussionCommandHandler : IRequestHandler<GetDiscussionCommand, object>
    {
        private readonly IClaimApprovalRepository _repository;


        public GetDiscussionCommandHandler(IClaimApprovalRepository repository)
        {

            _repository = repository;

        }
        public async Task<object> Handle(GetDiscussionCommand command, CancellationToken cancellationToken)
        {

            return await _repository.GetDiscussionList(command.userid, command.BranchId, command.OrgId);


        }
    }
}

