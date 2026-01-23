using Application.Procurement.InvoiceReceipt.GetAll;
using Core.Procurement.InvoiceReceipt;
using MediatR;
using Org.BouncyCastle.Asn1.Ocsp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.InvoiceReceipt.GetAllIRNList
{
    public class GetAllIRNListHandler : IRequestHandler<GetAllIRNList, object>
    {
        private readonly IIRNListRepository _repository;
        public GetAllIRNListHandler(IIRNListRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(GetAllIRNList command, CancellationToken cancellationToken)
        {
           

            var Result = await _repository.GetAllIRNL(command.branchid, command.orgid, command.supplierid, command.fromdate, command.todate,command.irnid,command.userid);
            return Result;
        }
    }
}
