using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Procurement.InvoiceReceipt.GetAllSupplierIRNList;
using Core.Procurement.InvoiceReceipt;
using MediatR;

namespace Application.Procurement.InvoiceReceipt.getIRNByid
{
    public class getIRNByIdHandler : IRequestHandler<getIRNByIdQuery, object>
    {
        private readonly IIRNListRepository _repository;
        public getIRNByIdHandler(IIRNListRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(getIRNByIdQuery command, CancellationToken cancellationToken)
        {
            var Result = await _repository.getIRNById(command.irnid,command.branchid, command.orgid);
            return Result;
        }
    }
}
