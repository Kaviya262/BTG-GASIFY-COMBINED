using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.OrderMng.Quotation;
using Core.OrderMng.SaleOrder;
using MediatR;
using UserPanel.Application.Quotation.GetQuotationSqNo;

namespace Application.Order.GetOrderSoNo
{
    public class GetOrderSoNoQueryHandler : IRequestHandler<GetOrderSoNoQuery, object>
    {
        private readonly ISaleOrderRepository _repository;
  

        public GetOrderSoNoQueryHandler(ISaleOrderRepository repository)
        {
            _repository = repository;
        }

       

        public async Task<object> Handle(GetOrderSoNoQuery command,CancellationToken cancellationToken)
        {


            var Result = await _repository.GetBySoNoAsync(command.BranchId);
            return Result;

        }

       
    }
}





