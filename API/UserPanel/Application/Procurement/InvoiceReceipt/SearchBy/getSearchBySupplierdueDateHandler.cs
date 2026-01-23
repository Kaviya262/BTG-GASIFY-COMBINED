using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Procurement.InvoiceReceipt.getSUpplierPODetailsView;
using Core.Procurement.InvoiceReceipt;
using MediatR;

namespace Application.Procurement.InvoiceReceipt.SearchBy
{
    public class getSearchBySupplierdueDateHandler : IRequestHandler<getSearchbySupplierduedate, object>
    {
        private readonly IInvoiceReceiptRepository _repository;
        public getSearchBySupplierdueDateHandler(IInvoiceReceiptRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(getSearchbySupplierduedate command, CancellationToken cancellationToken)
        {
            var Result = await _repository.getSearchbySupplierduedate(command.branchid, command.orgid, command.supplierid, command.fromdate, command.todate);
            return Result;
        }
    }
}
