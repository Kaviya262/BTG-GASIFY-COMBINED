using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.OrderMng.PackingAndDO;
using MediatR;  

namespace Application.PackingAndDO.GenerateInvoice
{
    public class GenerateInvoiceItemsQueryHandler : IRequestHandler<GenerateInvoiceItemsQuery, object>
    {



        private readonly IPackingAndDORepository _repository;

        public GenerateInvoiceItemsQueryHandler(IPackingAndDORepository repository)
        {
            _repository = repository;

        }
        public async Task<object> Handle(GenerateInvoiceItemsQuery command, CancellationToken cancellationToken)
        {
            var Result = await _repository.GenerateInvoice(command.PackingId, command.DOID);
            return Result;

        }



       

    }
}















