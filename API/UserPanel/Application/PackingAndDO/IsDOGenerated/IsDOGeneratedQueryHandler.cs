using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.OrderMng.PackingAndDO;
using Core.Shared;
using MediatR;
using UserPanel.Application.Quotation.GetQuotationItem;

namespace Application.PackingAndDO.IsDOGenerated
{
    public class IsDOGeneratedQueryHandler : IRequestHandler<IsDOGeneratedQuery, bool>
    {
        ExcellSheet ES = new ExcellSheet();
        private readonly IPackingAndDORepository _repository;
         
        public IsDOGeneratedQueryHandler(IPackingAndDORepository repository)
        {
            _repository = repository;
        }


        public async Task<bool> Handle(IsDOGeneratedQuery query, CancellationToken cancellationToken)
        {             
            var Result = await _repository.IsDogenerated(query.Id);
           
            return Result;
        }
    }


}