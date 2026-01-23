using Core.Procurement.InvoiceReceipt;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.InvoiceReceipt.GetAllSupplierIRNList
{
    public class GetAllSupplierIRNListQueryHandler : IRequestHandler<GetAllSupplierIRNListQuery, object>
    {
        private readonly IIRNListRepository _repository;
        public GetAllSupplierIRNListQueryHandler(IIRNListRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(GetAllSupplierIRNListQuery command, CancellationToken cancellationToken)
        {
           
            var Result = await _repository.GetAllSupplierIRNList(command.branchid, command.orgid);
            return Result;
        }
    }
}
