using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Procurement.InvoiceReceipt.GetInvoiceReceiptAddDetails;
using Core.Procurement.InvoiceReceipt;
using MediatR;

namespace Application.Procurement.InvoiceReceipt.AddIRNGRNDet
{
    public class AddIRNGRNDetHandler : IRequestHandler<AddIRNGRNQuery, object>
    {
        private readonly IInvoiceReceiptRepository _repository;
        public AddIRNGRNDetHandler(IInvoiceReceiptRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(AddIRNGRNQuery command, CancellationToken cancellationToken)
        {
            InvoiceEntry1 Items = new InvoiceEntry1();
            Items.item = command.item;
            var Result = await _repository.AddIRNGRN(Items);
            return Result;
        }
    }
}
