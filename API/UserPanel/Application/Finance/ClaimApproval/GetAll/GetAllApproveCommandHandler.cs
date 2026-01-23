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
    public class GetAllApproveCommandHandler : IRequestHandler<GetAllApproveCommand, object>
    {
        private readonly IClaimApprovalRepository _repository;


        public GetAllApproveCommandHandler(IClaimApprovalRepository repository)
        {

            _repository = repository;

        }
        public async Task<object> Handle(GetAllApproveCommand command, CancellationToken cancellationToken)
        {
            return command.Opt switch
            {
                1 => await _repository.GetAllAsync(command.id, command.BranchId, command.OrgId, command.userid),
                2 => await _repository.GetAllAsync(command.BankId, command.MODId, command.SupplierId, command.ApplicantId, command.userid,command.isDirector,command.PVPaymentId),
            };


        }
    }
}

