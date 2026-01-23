using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Procurement.InvoiceReceipt.ViewIRN;
using Core.Procurement.InvoiceReceipt;
using MediatR;

namespace Application.Procurement.InvoiceReceipt.GetInvoiceReceiptAddDetails
{
    public class getAddInvoiceReceiptHandler : IRequestHandler<getAddInvoiceReceiptCommand, object>
    {
        private readonly IInvoiceReceiptRepository _repository;
        public getAddInvoiceReceiptHandler(IInvoiceReceiptRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(getAddInvoiceReceiptCommand command, CancellationToken cancellationToken)
        {
            var Result = await _repository.getAddInvoiceReceiptDetails(command.orgid,command.branchid,command.fromdate,command.todate);
            return Result;
        }
    }
}
