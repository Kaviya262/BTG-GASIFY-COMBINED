using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.OrderMng.Quotation;
using MediatR;
using UserPanel.Application.Quotation.GetQuotationItem;

namespace Application.Quotation.CopyQuotationItem
{
    public class CopyQuotationItemByIdQueryHandler : IRequestHandler<CopyQuotationItemByIdQuery, object>
    {
        private readonly IQuotationRepository _repository;

        public CopyQuotationItemByIdQueryHandler(IQuotationRepository repository)
        {
            _repository = repository;
        }


        public async Task<object> Handle(CopyQuotationItemByIdQuery query, CancellationToken cancellationToken)
        {
            var Result = await _repository.CopyAsync(query.Id);
            return Result;
        }
    }


}