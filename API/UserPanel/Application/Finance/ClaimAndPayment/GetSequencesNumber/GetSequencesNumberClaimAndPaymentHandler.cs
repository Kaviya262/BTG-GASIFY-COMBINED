using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Finance.ClaimAndPayment.GetList;
using Application.Finance.ClaimAndPayment.GetSequencesNumber;
using Core.Finance.ClaimAndPayment;
using Core.OrderMng.Invoices;
using Core.OrderMng.SaleOrder;
using Core.Procurement.PurchaseMemo;
using MediatR;
using UserPanel.Application.Order.GetAllOrderItems;

namespace Application.Finance.ClaimAndPayment.GetList
{
    public class GetSequencesNumberClaimAndPaymentHandler : IRequestHandler<GetSequencesNumberClaimAndPayment, object>
    {
        private readonly IClaimAndPaymentRepository _repository;


        public GetSequencesNumberClaimAndPaymentHandler(IClaimAndPaymentRepository repository)
        {

            _repository = repository;

        }
        public async Task<object> Handle(GetSequencesNumberClaimAndPayment command, CancellationToken cancellationToken)
        {

            var Result = await _repository.GetSequencesNo(command.BranchId,command.orgid,command.userid);
            return Result;

        }
    }
}

