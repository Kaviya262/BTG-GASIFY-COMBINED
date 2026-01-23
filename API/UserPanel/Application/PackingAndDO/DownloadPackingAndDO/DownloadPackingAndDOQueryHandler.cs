using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.OrderMng.PackingAndDO;
using Core.Shared;
using MediatR;
using UserPanel.Application.Quotation.GetQuotationItem;

namespace Application.PackingAndDO.DownloadPackingAndDO
{
    public class DownloadPackingAndDOQueryHandler : IRequestHandler<DownloadPackingAndDOQuery, ExcelSheetItems>
    {
        private readonly IPackingAndDORepository _repository;
        ExcellSheet ES = new ExcellSheet();
        public DownloadPackingAndDOQueryHandler(IPackingAndDORepository repository)
        {
            _repository = repository;
        }


        public async Task<ExcelSheetItems> Handle(DownloadPackingAndDOQuery query, CancellationToken cancellationToken)
        {
            var Result = await _repository.DownloadDO(query.Id);
            var data=await ES.DownloadExcelWithMultipleSheet(Result.GetType().GetProperty("Data")?.GetValue(Result));
            return data;
        }
    }


}