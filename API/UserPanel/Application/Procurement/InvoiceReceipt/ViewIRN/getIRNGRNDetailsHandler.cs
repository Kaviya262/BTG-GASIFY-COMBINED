using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Procurement.InvoiceReceipt.SearchBy;
using Core.Procurement.InvoiceReceipt;
using MediatR;

namespace Application.Procurement.InvoiceReceipt.ViewIRN
{
    public class getIRNGRNDetailsHandler : IRequestHandler<getIRNGRNDetailsCommand, object>
    {
        private readonly IInvoiceReceiptRepository _repository;
        public getIRNGRNDetailsHandler(IInvoiceReceiptRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(getIRNGRNDetailsCommand command, CancellationToken cancellationToken)
        {
            var Result = await _repository.getIRNGRNDetails(command.receiptnote_hdr_id);
            return Result;
        }
    }
}
