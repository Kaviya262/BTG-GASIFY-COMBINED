using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.OrderMng.Invoices;
using Core.OrderMng.SaleOrder;
using Core.Procurement.PurchaseMemo;
using MediatR;

namespace Application.Procurement.Purchase_Memo.GetPurchaseMemoItem
{
    public class GetPurchaseMemoByIdQueryHandler : IRequestHandler<GetPurchaseMemoByIdQuery, object>
    {
        private readonly IPurchaseMemoRepository _repository;


        public GetPurchaseMemoByIdQueryHandler(IPurchaseMemoRepository repository)
        {
            _repository = repository;

        }
        public async Task<object> Handle(GetPurchaseMemoByIdQuery query, CancellationToken cancellationToken)
        {
            var Result = await _repository.GetByIdAsync(query.Id,query.OrgId);
            return Result;
           // return null;

        }
    }
}
