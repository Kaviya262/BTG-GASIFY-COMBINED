using Application.PackingAndDO.GetPackingItem;
using Core.OrderMng.PackingAndDO;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.PackingAndDO.DocPrint
{
    internal class GetDocPrintQueryHandler : IRequestHandler<GetDocPrintQuery, object>

    {
        private readonly IPackingAndDORepository _repository;

        public GetDocPrintQueryHandler(IPackingAndDORepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(GetDocPrintQuery query, CancellationToken cancellationToken)
        {
            var Result = await _repository.docprint(query.Id);
            return Result;
        }
    }
}
