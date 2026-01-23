using System;
using System.Collections.Generic;
using System.Formats.Asn1;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.OrderMng.ProductionOrder;
using MediatR;
using UserPanel.Application.ProductionOrder.GetProductionOrderSqNo;


namespace UserPanel.ProductionOrder.GetProductionOrderSqNo
{
    public class GetProductionOrderSqNoQueryHandler : IRequestHandler<GetProductionOrderSqNoQuery, object>
    {
        private readonly IProductionRepository _repository;

        public GetProductionOrderSqNoQueryHandler(IProductionRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(GetProductionOrderSqNoQuery command, CancellationToken cancellationToken)
        {
            var Result = await _repository.GetByProductionOrderNoAsync(command.BranchId);
            return Result;
        }

    }
}






