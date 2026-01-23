using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks; 
using Core.Procurement.InvoiceReceipt;
using MediatR;

namespace Application.Procurement.InvoiceReceipt.GetAll
{
    public class GetAllinvoiceHandler : IRequestHandler<GetAllinvoice, object>
    {
        private readonly IInvoiceReceiptRepository _repository;
        public GetAllinvoiceHandler(IInvoiceReceiptRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(GetAllinvoice command, CancellationToken cancellationToken)
        {
            var Result = await _repository.GetInvoiceReceiptAll(command.supplier_id, command.org_id,command.branchid);
            return Result;
        }
    }
}




