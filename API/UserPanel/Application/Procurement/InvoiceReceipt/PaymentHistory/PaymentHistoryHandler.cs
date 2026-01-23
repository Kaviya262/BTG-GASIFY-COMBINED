using Application.Procurement.InvoiceReceipt.GetAll;
using Core.Procurement.InvoiceReceipt;
using MediatR;
using Org.BouncyCastle.Asn1.Ocsp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.InvoiceReceipt.PaymentHistory
{
    public class PaymentHistoryHandler : IRequestHandler<PaymentHistoryQuery, object>
    {
        private readonly IIRNListRepository _repository;
        public PaymentHistoryHandler(IIRNListRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(PaymentHistoryQuery command, CancellationToken cancellationToken)
        {
           

            var Result = await _repository.GetPaymentHistory(command.branchid, command.orgid, command.supplierid, command.fromdate, command.todate);
            return Result;
        }
    }
}
