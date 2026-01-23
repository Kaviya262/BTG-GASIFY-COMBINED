using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.PackingAndDO.ExportPackingAndDO;
using Core.OrderMng.Distribution.PackingList;
using Core.OrderMng.PackingAndDO;
using Core.Shared;
using DocumentFormat.OpenXml.Drawing;
using MediatR;
using UserPanel.Application.Quotation.GetQuotationItem;

namespace Application.PackingAndDO.ExportPackingAndDO
{
    public class ExportPackingAndDOQueryHandlers : IRequestHandler<ExportPackingAndDOQuerys, ExcelSheetItems>
    {
        private readonly Core.OrderMng.Distribution.PackingList.IPackingListRepository _repository;
        ExcellSheet ES = new ExcellSheet();
        public ExportPackingAndDOQueryHandlers(IPackingListRepository repository)
        {
            _repository = repository;
        }


        public async Task<ExcelSheetItems> Handle(ExportPackingAndDOQuerys command, CancellationToken cancellationToken)
        {
            var Result = await _repository.GetAllExportAsync(command.BranchId);

            var data=await ES.DownloadPackingAndDO(Result.GetType().GetProperty("Data")?.GetValue(Result),command.Types);
            return data;
        }
    }


}