using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.OrderMng.Quotation;
using MediatR;

using UserPanel.Core.Abstractions;


using UserPanel.Core.Abstractions;
using Core.OrderMng.SaleOrder;
using Core.Abstractions;

namespace Application.Order.UpdateOrderItem
{
    public  class UpdateOrderItemCommandHandler : IRequestHandler<UpdateOrderItemCommand,object>
    {
        private readonly ISaleOrderRepository _repository;

        private readonly IUnitOfWorkDB1 _unitOfWork;
        
        
        public UpdateOrderItemCommandHandler(ISaleOrderRepository repository, IUnitOfWorkDB1 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
            
        }
        public async Task<object> Handle(UpdateOrderItemCommand command,CancellationToken cancellationToken)
        {
            SaleOrderItemmain saleOrderItems = new SaleOrderItemmain();
            saleOrderItems.Details = command.Details;
            saleOrderItems.Header = command.Header;
            saleOrderItems.SQDetail = command.SQDetail;

            var data = await _repository.UpdateAsync(saleOrderItems);
            _unitOfWork.Commit();

            return data;


        }
    }
}



