using Application.Procurement.Master.Item.CreateItem;
using Core.Abstractions;
using Core.Master.Item;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Master.Item.UpdateItem
{
    public class UpdateItemCommandHandler : IRequestHandler<UpdateItemCommand, object>
    {
        private readonly IItemMasterRepository _repository;
        private readonly IUnitOfWorkDB4 _unitOfWork;

        public UpdateItemCommandHandler(IItemMasterRepository repository, IUnitOfWorkDB4 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<object> Handle(UpdateItemCommand command, CancellationToken cancellationToken)
        {
            ItemMaster Items = new ItemMaster();
            Items.Master = command.Master;

            var data = await _repository.UpdateAsync(Items);
            _unitOfWork.Commit();
            return data;

        }

    }
}
