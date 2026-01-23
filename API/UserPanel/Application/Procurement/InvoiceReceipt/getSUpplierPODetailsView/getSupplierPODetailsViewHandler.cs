using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Procurement.InvoiceReceipt;
using MediatR;

namespace Application.Procurement.InvoiceReceipt.getSUpplierPODetailsView
{
    public class getSupplierPODetailsViewHandler : IRequestHandler<getSupplierPODetailsView, object>
    {
        private readonly IInvoiceReceiptRepository _repository;
        public getSupplierPODetailsViewHandler(IInvoiceReceiptRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(getSupplierPODetailsView command, CancellationToken cancellationToken)
        {
            var Result = await _repository.getSupplierPODetailsView(command.po_id, command.org_id,command.cid);
            return Result;
        }
    }
}
