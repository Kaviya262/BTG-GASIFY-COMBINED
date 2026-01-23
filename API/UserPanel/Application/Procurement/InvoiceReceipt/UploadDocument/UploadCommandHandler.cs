using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Procurement.InvoiceReceipt;
using MediatR;

namespace Application.Procurement.InvoiceReceipt.UploadDocument
{
    public class UploadCommandHandler : IRequestHandler<UploadInvoiceReceiptCommand, object>
    {
        private readonly IInvoiceReceiptRepository _repository;
        public UploadCommandHandler(IInvoiceReceiptRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(UploadInvoiceReceiptCommand command, CancellationToken cancellationToken)
        {
            var data = await _repository.InvoiceReceiptAttachment(command.receiptnote_hdr_id,command.file_path,command.file_name);
            return data;

        }
    }
}
