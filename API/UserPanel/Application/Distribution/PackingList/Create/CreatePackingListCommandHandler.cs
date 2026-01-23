using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Abstractions;
using Core.OrderMng.Distribution.MasterSalesOrders;
using Core.OrderMng.Distribution.PackingList;
using Core.OrderMng.PackingAndDO;
using MediatR;

namespace Application.Distribution.PackingList.Create
{
    public class CreatePackingListCommandHandler : IRequestHandler<CreatePackingListCommand, object>
    {
        private readonly Core.OrderMng.Distribution.PackingList.IPackingListRepository _repository;
        private readonly IUnitOfWorkDB1 _unitOfWork;

        public CreatePackingListCommandHandler(IPackingListRepository repository, IUnitOfWorkDB1 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }
        public async Task<object> Handle(CreatePackingListCommand command, CancellationToken cancellationToken)
        {

            var data = await _repository.AddAsync(command.Barcodes,command.PackingDetailsId,command.PackingId,command.RackId,command.IsSubmitted,command.userId,command.PackNo);
            return data;

        }

    }
}
