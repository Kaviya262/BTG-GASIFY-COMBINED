using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Abstractions;
using Core.Finance.ClaimAndPayment;
using Core.OrderMng.Invoices;
using Core.Procurement.PurchaseMemo;
using MediatR;
 
namespace Application.Procurement.Purchase_Memo.CreatePurchaseMemoItem
{
    public class CreatePurchaseMemoCommandHandler : IRequestHandler<CreatePurchaseMemoCommand, object>
    {
        private readonly IPurchaseMemoRepository _repository;
        private readonly IUnitOfWorkDB2 _unitOfWork;



        public CreatePurchaseMemoCommandHandler(IPurchaseMemoRepository repository, IUnitOfWorkDB2 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<object> Handle(CreatePurchaseMemoCommand command, CancellationToken cancellationToken)
        {
            PurchaseMemo Items = new PurchaseMemo();
            Items.Header = command.Header;
            Items.Details = command.Details;

            var data = await _repository.AddAsync(Items);
                       // _unitOfWork.Commit();
            return data ;

        }
    }
}

