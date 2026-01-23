using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Abstractions;
using Core.OrderMng.Distribution.MasterSalesOrders;
using Core.OrderMng.PackingAndDO;
using MediatR;

namespace Application.Distribution.Update
{
    public class UpdateMasterSalesOrderCommandHandler : IRequestHandler<UpdatePackingAndDOCommands, object>
    {
        private readonly IMasterSalesOrderRepository _repository;
        private readonly IUnitOfWorkDB1 _unitOfWork;

        public UpdateMasterSalesOrderCommandHandler(IMasterSalesOrderRepository repository, IUnitOfWorkDB1 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }
        public async Task<object> Handle(UpdatePackingAndDOCommands command, CancellationToken cancellationToken)
        {
            PackingAndDOItems PackingItems = new PackingAndDOItems();
            PackingItems.Details = command.Details;
            PackingItems.Header = command.Header;
            PackingItems.SODtl = command.SODtl;
            PackingItems.Customers = command.Customers;
            PackingItems.GasDtl = command.GasDtl;

            var data = await _repository.UpdateAsync(PackingItems);
            _unitOfWork.Commit();
            return data;

        }

    }
}
