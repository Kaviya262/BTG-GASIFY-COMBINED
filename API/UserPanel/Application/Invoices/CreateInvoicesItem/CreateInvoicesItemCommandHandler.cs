using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Abstractions;
using Core.OrderMng.Invoices;
using Core.OrderMng.SaleOrder;
using MediatR;
using UserPanel.Application.Invoices.CreateInvoicesItem;
using UserPanel.Core.Abstractions;

namespace Application.Invoices.CreateInvoicesItem
{
    public class CreateInvoicesItemCommandHandler : IRequestHandler<CreateInvoicesItemCommand, object>
    {
        private readonly IInvoicesRepository _repository;
        private readonly IUnitOfWorkDB1 _unitOfWork;


        public CreateInvoicesItemCommandHandler(IInvoicesRepository repository, IUnitOfWorkDB1 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;

        }

        public async Task<object> Handle(CreateInvoicesItemCommand command, CancellationToken cancellationToken)
        {
            InvoiceItemMain InvoicesItems = new InvoiceItemMain();
            InvoicesItems.Details = command.Details;
            InvoicesItems.Header = command.Header;
            InvoicesItems.DODetail = command.DODetail;

            var data = await _repository.AddAsync(InvoicesItems);
            _unitOfWork.Commit();
            return data;

        }
    }
}

