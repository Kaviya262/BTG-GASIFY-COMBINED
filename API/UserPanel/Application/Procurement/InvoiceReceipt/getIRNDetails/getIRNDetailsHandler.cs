using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Procurement.InvoiceReceipt.GetInvoiceReceiptAddDetails;
using Core.Procurement.InvoiceReceipt;
using MediatR;

namespace Application.Procurement.InvoiceReceipt.getIRNDetails
{
    public class getIRNDetailsHandler : IRequestHandler<getIRNDetailsCommand, object>
    {
        private readonly IInvoiceReceiptRepository _repository;
        public getIRNDetailsHandler(IInvoiceReceiptRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(getIRNDetailsCommand command, CancellationToken cancellationToken)
        {
            var Result = await _repository.getIRNDetails(command.orgid, command.branchid, command.fromdate, command.todate);
            return Result;
        }
    }
}
