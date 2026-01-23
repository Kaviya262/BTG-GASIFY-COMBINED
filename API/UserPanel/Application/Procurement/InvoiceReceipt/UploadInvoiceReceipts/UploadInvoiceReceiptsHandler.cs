using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Procurement.InvoiceReceipt.UploadDocument;
using Core.Procurement.InvoiceReceipt;
using MediatR;

namespace Application.Procurement.InvoiceReceipt.UploadInvoiceReceipts
{
    public class UploadInvoiceReceiptsHandler : IRequestHandler<UploadInvoiceReceiptsQuery, object>
    {
        private readonly IInvoiceReceiptRepository _repository;
        public UploadInvoiceReceiptsHandler(IInvoiceReceiptRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(UploadInvoiceReceiptsQuery command, CancellationToken cancellationToken)
        {
            var data = await _repository.InvoiceReceiptDocAttachment(command.attachmentList);
            return data;

        }
    }
}
