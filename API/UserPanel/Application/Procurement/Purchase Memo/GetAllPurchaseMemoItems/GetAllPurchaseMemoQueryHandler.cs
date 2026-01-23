using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.OrderMng.Invoices;
using Core.OrderMng.SaleOrder;
using Core.Procurement.PurchaseMemo;
using MediatR;
using UserPanel.Application.Order.GetAllOrderItems;

namespace Application.Procurement.Purchase_Memo.GetAllPurchaseMemoItems
{
    public class GetAllPurchaseMemoQueryHandler : IRequestHandler<GetAllPurchaseMemoQuery, object>
    {
        private readonly IPurchaseMemoRepository _repository;


        public GetAllPurchaseMemoQueryHandler(IPurchaseMemoRepository repository)
        {

            _repository = repository;

        }
        public async Task<object> Handle(GetAllPurchaseMemoQuery command, CancellationToken cancellationToken)
        {

            var Result = await _repository.GetAllAsync(command.requesterid, command.BranchId,command.OrgId,command.pmnumber,command.userid);
            return Result;

        }
    }
}

