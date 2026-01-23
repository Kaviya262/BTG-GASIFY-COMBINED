using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.OrderMng.PackingAndDO;
using MediatR;
using UserPanel.Application.Order.GetAllOrderItems;

namespace Application.PackingAndDO.GetAllPackingItems
{
    public class GetAllPackingItemsQueryHandler : IRequestHandler<GetAllPackingItemsQuery,object>
    {



        private readonly IPackingAndDORepository _repository;

        public GetAllPackingItemsQueryHandler(IPackingAndDORepository repository)
        {
            _repository = repository;

        }
        public async Task<object> Handle(GetAllPackingItemsQuery command, CancellationToken cancellationToken)
        {
            var Result = await _repository.GetAllAsync(command.packingid, command.from_date, command.to_date, command.BranchId,command.GasCodeId,command.customerid,command.esttime,command.packerid);
            return Result;

        }



       

    }
}















