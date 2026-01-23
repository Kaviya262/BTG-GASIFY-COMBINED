using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.OrderMng.PackingAndDO;
using Core.OrderMng.Quotation;
using MediatR;
using UserPanel.Application.Quotation.GetQuotationItem;

namespace Application.PackingAndDO.GetPackingItem
{
    public  class GetPackingItemByIdQueryHandler : IRequestHandler<GetPackingItemByIdQuery, object>

    {
        private readonly IPackingAndDORepository _repository;

        public GetPackingItemByIdQueryHandler(IPackingAndDORepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(GetPackingItemByIdQuery query,CancellationToken cancellationToken)
        {
            var Result = await _repository.GetByIdAsync(query.Id);
            return Result;
        }
    }
}







