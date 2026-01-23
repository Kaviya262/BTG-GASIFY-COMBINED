using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Abstractions;
using Core.ReturnOrder;
using MediatR;
 
using UserPanel.Core.Abstractions;



namespace UserPanel.Application.ReturnOrder.CreateReturnOrderItem;
    public  class CreateReturnOrderItemCommandHandler : IRequestHandler<CreateReturnOrderItemCommand, object>
    {
        private readonly IReturnOrderRepository _repository;
        private readonly IUnitOfWorkDB1 _unitOfWork;

        public CreateReturnOrderItemCommandHandler(IReturnOrderRepository repository, IUnitOfWorkDB1 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }
        public async Task<object> Handle (CreateReturnOrderItemCommand command, CancellationToken cancellationToken)
        {
        ReturnOrderItem returnOrderItems = new ReturnOrderItem();
        returnOrderItems.Details = command.Details;
        returnOrderItems.Header = command.Header;
        returnOrderItems.DODetail = command.DODetail;
        returnOrderItems.GasDetail = command.GasDetail;

        var data = await _repository.AddAsync(returnOrderItems);
            _unitOfWork.Commit();
            return data;

        }

    }
 