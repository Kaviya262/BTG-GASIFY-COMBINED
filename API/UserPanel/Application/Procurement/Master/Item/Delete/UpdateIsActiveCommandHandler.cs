using Core.Abstractions;
using Core.Master.Item;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Master.Item.Delete
{
    public class UpdateIsActiveCommandHandler : IRequestHandler<UpdateIsActiveCommand, object>
    {
        private readonly IItemMasterRepository _repository;
        private readonly IUnitOfWorkDB4 _unitOfWork;

        public UpdateIsActiveCommandHandler(IItemMasterRepository repository, IUnitOfWorkDB4 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<object> Handle(UpdateIsActiveCommand command, CancellationToken cancellationToken)
        {
            return await _repository.UpdateActiveateAsync(command.ItemId, command.IsActive);

        }
    }
}
