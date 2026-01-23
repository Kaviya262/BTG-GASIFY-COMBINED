using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Procurement.InvoiceReceipt.AddIRN;
 
using Core.Abstractions;
using Core.Procurement.InvoiceReceipt;
using MediatR;

namespace Application.Procurement.InvoiceReceipt.AddIRN
{
    public class AddIRNHandler : IRequestHandler<AddIRNQuery, object>
    {
        private readonly IInvoiceReceiptRepository _repository;

        private readonly IUnitOfWorkDB2 _unitOfWork;
        public AddIRNHandler(IInvoiceReceiptRepository repository, IUnitOfWorkDB2 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }
        public async Task<object> Handle(AddIRNQuery command, CancellationToken cancellationToken)
        {
            InvoiceEntry Items = new InvoiceEntry();
            Items.Header = command.Header;
            Items.Details = command.Details;
            Items.Requisition = command.Requisition;

            var data = await _repository.AddIRN(Items);
            _unitOfWork.Commit();

            return data;
        }
    }
}
