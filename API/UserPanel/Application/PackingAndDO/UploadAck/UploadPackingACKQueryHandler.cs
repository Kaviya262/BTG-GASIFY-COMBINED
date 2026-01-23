using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.OrderMng.PackingAndDO;
using Core.Shared;
using MediatR;
using UserPanel.Application.Quotation.GetQuotationItem;

namespace Application.PackingAndDO.UploadAck
{
    public class UploadPackingACKQueryHandler : IRequestHandler<UploadPackingACKQuery, object>
    {
        ExcellSheet ES = new ExcellSheet();
        private readonly IPackingAndDORepository _repository;
         
        public UploadPackingACKQueryHandler(IPackingAndDORepository repository)
        {
            _repository = repository;
        }


        public async Task<object> Handle(UploadPackingACKQuery query, CancellationToken cancellationToken)
        {             
            var Result = await _repository.UploadACK(query.Id,query.Path,query.FileName,query.UserId);
           
            return Result;
        }
    }


}