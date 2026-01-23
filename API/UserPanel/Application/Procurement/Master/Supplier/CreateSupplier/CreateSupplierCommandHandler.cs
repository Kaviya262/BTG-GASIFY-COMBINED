using Application.Procurement.Purchase_Requitision.CreatePurchaseRequitisionItem;
using Core.Abstractions;
using Core.Master.Supplier;
using Core.Procurement.PurchaseRequisition;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Master.Supplier.CreateSupplier
{
    public class CreateSupplierCommandHandler : IRequestHandler<CreateSupplierCommand , object>
    {
        private readonly ISupplierMasterRepository _repository;
        private readonly IUnitOfWorkDB4 _unitOfWork;

        public CreateSupplierCommandHandler(ISupplierMasterRepository repository, IUnitOfWorkDB4 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<object> Handle(CreateSupplierCommand command, CancellationToken cancellationToken)
        {
            SupplierMaster Items = new SupplierMaster();
            Items.Master = command.Master;
            Items.Currency = command.Currency;

            var data = await _repository.AddAsync(Items);
            _unitOfWork.Commit();
            return data;


        }
    }
}
