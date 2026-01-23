using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Abstractions;
using Core.OrderMng.SaleOrder;
using MediatR;
using UserPanel.Application.Order.CreateOrderItem;

using UserPanel.Core.Abstractions;



namespace Application.Order.CreateOrderItem
{
    public  class CreateOrderItemCommandHandler :IRequestHandler<CreateOrderItemCommand, object>
    {
        private readonly ISaleOrderRepository _repository;
        private readonly IUnitOfWorkDB1 _unitOfWork;

        public CreateOrderItemCommandHandler(ISaleOrderRepository repository, IUnitOfWorkDB1 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }
        public async Task<object> Handle (CreateOrderItemCommand command, CancellationToken cancellationToken)
        {
            SaleOrderItemmain saleOrderItems = new SaleOrderItemmain();
            saleOrderItems.Details = command.Details;
            saleOrderItems.Header = command.Header;
            saleOrderItems.SQDetail = command.SQDetail;
          
            var data = await _repository.AddAsync(saleOrderItems);
            _unitOfWork.Commit();
            return data;

        }

    }
}


