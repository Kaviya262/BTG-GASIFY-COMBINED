using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Procurement.InvoiceReceipt.UpdatePOSupplierItemDetailsView;
using Core.Abstractions;
using Core.Procurement.InvoiceReceipt;
using MediatR;

namespace Application.Procurement.InvoiceReceipt.GenerateInvoiceReceipt
{
    public class GenerateInvoiceReceiptHandler : IRequestHandler<GenerateInvoiceReceiptQuery, object>
    {
        private readonly IInvoiceReceiptRepository _repository;
        private readonly IUnitOfWorkDB2 _unitOfWork;
        public GenerateInvoiceReceiptHandler(IInvoiceReceiptRepository repository, IUnitOfWorkDB2 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }
        public async Task<object> Handle(GenerateInvoiceReceiptQuery command, CancellationToken cancellationToken)
        {
            InvoiceGenerate Items = new InvoiceGenerate();
            Items.Header = command.Header;

            var data = await _repository.GenerateInvoiceReceipt(Items);
            _unitOfWork.Commit();

            return data;
        }
    }
}
