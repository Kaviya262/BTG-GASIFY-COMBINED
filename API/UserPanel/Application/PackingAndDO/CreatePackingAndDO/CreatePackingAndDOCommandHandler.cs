using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Abstractions;
using Core.OrderMng.PackingAndDO;
using Core.OrderMng.SaleOrder;
using MediatR;
 

using UserPanel.Core.Abstractions;



namespace Application.PackingAndDO.CreatePackingAndDO
{
    public  class CreatePackingAndDOCommandHandler : IRequestHandler<CreatePackingAndDOCommands, object>
    {
        private readonly IPackingAndDORepository _repository;
        private readonly IUnitOfWorkDB1 _unitOfWork;

        public CreatePackingAndDOCommandHandler(IPackingAndDORepository repository, IUnitOfWorkDB1 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }
        public async Task<object> Handle (CreatePackingAndDOCommands command, CancellationToken cancellationToken)
        {
            PackingAndDOItems PackingItems = new PackingAndDOItems();
            PackingItems.Details = command.Details;
            PackingItems.Header = command.Header;
            PackingItems.SODtl = command.SODtl;
            PackingItems.Customers = command.Customers;
            PackingItems.GasDtl = command.GasDtl;

            var data = await _repository.AddAsync(PackingItems);
            _unitOfWork.Commit();
            return data;

        }

    }
}


