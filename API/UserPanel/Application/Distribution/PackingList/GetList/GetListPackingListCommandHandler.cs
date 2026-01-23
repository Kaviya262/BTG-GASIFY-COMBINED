using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Finance.ClaimAndPayment.GetList;
using Core.Abstractions;
using Core.Finance.ClaimAndPayment;
using Core.OrderMng.Distribution.MasterSalesOrders;
using Core.OrderMng.Distribution.PackingList;
using MediatR;

namespace Application.Distribution.PackingList.GetList
{
    public class GetListPackingListCommandHandler : IRequestHandler<GetListPackingListCommand, object>
    {
        private readonly Core.OrderMng.Distribution.PackingList.IPackingListRepository _repository;
        private readonly IUnitOfWorkDB1 _unitOfWork;
        public GetListPackingListCommandHandler(Core.OrderMng.Distribution.PackingList.IPackingListRepository repository, IUnitOfWorkDB1 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }
        public async Task<object> Handle(GetListPackingListCommand command, CancellationToken cancellationToken)
        {
            var Result = await _repository.GetAll(command.SearchBy, command.CustomerId, command.GasCodeId, command.BranchId);
            return Result;

        }
    }
}
