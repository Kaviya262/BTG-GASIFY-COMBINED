using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Procurement.Purchase_Memo.UploadDocument;
using Core.Abstractions;
using Core.Finance.ClaimAndPayment;
using Core.OrderMng.Invoices;
using Core.Procurement.PurchaseMemo;
using MediatR;
 
namespace Application.Procurement.Purchase_Memo.UploadDocument
{
    public class UploadCommandHandler : IRequestHandler<UploadCommand, object>
    {
        private readonly IPurchaseMemoRepository _repository;

        public UploadCommandHandler(IPurchaseMemoRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(UploadCommand command, CancellationToken cancellationToken)
        {
            var data = await _repository.UploadDocument(command.attachmentList);
            return data ;

        }
    }
}

