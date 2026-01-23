using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.OrderMng.PackingAndDO;
using MediatR;
using UserPanel.Application.ProductionOrder.GetProductionOrderSqNo;

namespace Application.PackingAndDO.GetPackingPackNo
{
    public class GetPackingPackNoQueryHandler : IRequestHandler<GetPackingPackNoQuery, object>
    {
        private readonly IPackingAndDORepository _repository;


        public GetPackingPackNoQueryHandler(IPackingAndDORepository repository)
        {
            _repository = repository;
        }



        public async Task<object> Handle(GetPackingPackNoQuery command, CancellationToken cancellationToken)
        {
            var Result = await _repository.GetByPackNoAsync(command.BranchId);
            return Result;
        }

    }
}









