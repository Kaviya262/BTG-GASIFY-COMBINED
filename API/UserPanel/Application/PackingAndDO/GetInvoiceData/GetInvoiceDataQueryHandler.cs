using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.OrderMng.PackingAndDO;
using MediatR;
using UserPanel.Application.ProductionOrder.GetProductionOrderSqNo;

namespace Application.PackingAndDO.GetInvoiceData
{
    public class GetInvoiceDataQueryHandler : IRequestHandler<GetInvoiceDataNoQuery, object>
    {
        private readonly IPackingAndDORepository _repository;


        public GetInvoiceDataQueryHandler(IPackingAndDORepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(GetInvoiceDataNoQuery command, CancellationToken cancellationToken)
        {
            var Result = await _repository.GetInvoiceData(command.PackingId);
            return Result;
        }

    }
}









