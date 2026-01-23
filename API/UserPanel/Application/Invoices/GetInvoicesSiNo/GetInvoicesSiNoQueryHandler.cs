using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.OrderMng.Invoices;
using Core.OrderMng.SaleOrder;
using MediatR;

namespace Application.Invoices.GetInvoicesSiNo
{
    public class GetInvoicesSiNoQueryHandler : IRequestHandler<GetInvoicesSiNoQuery, object>
    {
        private readonly IInvoicesRepository _repository;

        public GetInvoicesSiNoQueryHandler(IInvoicesRepository repository)
        {
            _repository = repository;

        }
        public async Task<object> Handle(GetInvoicesSiNoQuery command, CancellationToken cancellationToken)
        {
            var Result = await _repository.GetBySiNoAsync(command.BranchId,command.typeid);
            return Result;

        }
    }
}
