using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Finance.ClaimAndPayment.GetList;
using Core.Finance.ClaimAndPayment;
using Core.OrderMng.Invoices;
using Core.OrderMng.SaleOrder;
using Core.Procurement.PurchaseMemo;
using MediatR;
using UserPanel.Application.Order.GetAllOrderItems;

namespace Application.Finance.ClaimAndPayment.GetList
{
    public class GetListClaimAndPaymentCommandHandler : IRequestHandler<GetListClaimAndPaymentCommand, object>
    {
        private readonly IClaimAndPaymentRepository _repository;


        public GetListClaimAndPaymentCommandHandler(IClaimAndPaymentRepository repository)
        {

            _repository = repository;

        }
        public async Task<object> Handle(GetListClaimAndPaymentCommand command, CancellationToken cancellationToken)
        {

            var Result = await _repository.GetAllAsync(command.OrgId, command.BranchId,command.OrgId,command.departmentid,command.categoryid,command.currencyid,command.user_id,command.claimtypeid);
            return Result;

        }
    }
}

