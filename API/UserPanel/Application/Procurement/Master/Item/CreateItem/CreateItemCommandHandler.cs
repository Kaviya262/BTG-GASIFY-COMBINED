using Application.Procurement.Master.Supplier.CreateSupplier;
using Core.Abstractions;
using Core.Master.Item;
using Core.Master.Supplier;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Master.Item.CreateItem
{
    public class CreateItemCommandHandler : IRequestHandler<CreateItemCommand, object>
    {
        private readonly IItemMasterRepository _repository;
        private readonly IUnitOfWorkDB4 _unitOfWork;

        public CreateItemCommandHandler(IItemMasterRepository repository, IUnitOfWorkDB4 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<object> Handle(CreateItemCommand command, CancellationToken cancellationToken)
        {
            ItemMaster Items = new ItemMaster();
            Items.Master = command.Master;           

            var data = await _repository.AddAsync(Items);
            _unitOfWork.Commit();
            return data;

        }

    }
}
