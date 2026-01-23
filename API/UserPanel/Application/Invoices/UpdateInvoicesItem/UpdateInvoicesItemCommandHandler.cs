using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Abstractions;
using Core.OrderMng.Invoices;

using MediatR;
using UserPanel.Core.Abstractions;

namespace Application.Invoices.UpdateInvoicesitem
{
    public class UpdateInvoicesItemCommandHandler : IRequestHandler<UpdateInvoicesItemCommand, object>
    {

        private readonly IInvoicesRepository _repository;

        private readonly IUnitOfWorkDB1 _unitOfWork;



        public UpdateInvoicesItemCommandHandler(IInvoicesRepository repository, IUnitOfWorkDB1 unitOfWork)
        {



            _repository = repository;
            _unitOfWork = unitOfWork;

        }
        public async Task<object> Handle(UpdateInvoicesItemCommand command, CancellationToken cancellationToken)
        {
            InvoiceItemMain InvoicesItems = new InvoiceItemMain();
            InvoicesItems.Details = command.Details;
            InvoicesItems.Header = command.Header;
            InvoicesItems.DODetail = command.DODetail;
            var data = await _repository.UpdateAsync(InvoicesItems);
            _unitOfWork.Commit();

            return data;


        }


    }
}

