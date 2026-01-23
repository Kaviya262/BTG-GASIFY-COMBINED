using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.PackingAndDO.ExportPackingAndDO;
using Core.OrderMng.PackingAndDO;
using Core.Shared;
using DocumentFormat.OpenXml.Drawing;
using MediatR;
using UserPanel.Application.Quotation.GetQuotationItem;

namespace Application.PackingAndDO.ExportPackingAndDO
{
    public class ExportPackingAndDOQueryHandler : IRequestHandler<ExportPackingAndDOQuery, ExcelSheetItems>
    {
        private readonly IPackingAndDORepository _repository;
        ExcellSheet ES = new ExcellSheet();
        public ExportPackingAndDOQueryHandler(IPackingAndDORepository repository)
        {
            _repository = repository;
        }


        public async Task<ExcelSheetItems> Handle(ExportPackingAndDOQuery command, CancellationToken cancellationToken)
        {
            var Result = await _repository.GetAllExportAsync(command.packingid, command.from_date, command.to_date, command.BranchId,command.GasCodeId, command.customerid, command.esttime, command.packerid);

            var data=await ES.DownloadPackingAndDO(Result.GetType().GetProperty("Data")?.GetValue(Result),command.Types);
            return data;
        }
    }


}