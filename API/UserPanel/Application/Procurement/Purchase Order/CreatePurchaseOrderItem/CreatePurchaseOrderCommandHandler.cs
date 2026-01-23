using Core.Abstractions;
using Core.Procurement.PurchaseOrder;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace Application.Procurement.Purchase_Order.CreatePurchaseOrderItem
{
    public class CreatePurchaseOrderCommandHandler : IRequestHandler<CreatePurchaseOrderCommand , object>
    {
        private readonly IPurchaseOrderRepository _repository;
        private readonly IUnitOfWorkDB1 _unitOfWork;


        public CreatePurchaseOrderCommandHandler(IPurchaseOrderRepository repository, IUnitOfWorkDB1 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<object> Handle(CreatePurchaseOrderCommand command, CancellationToken cancellationToken)
        {
            PurchaseOrder Items = new PurchaseOrder();
            Items.Header = command.Header;
            Items.Details = command.Details;
            Items.Requisition = command.Requisition;

            var data = await _repository.AddAsync(Items);
            _unitOfWork.Commit();
            return data;


        }
    }
}
