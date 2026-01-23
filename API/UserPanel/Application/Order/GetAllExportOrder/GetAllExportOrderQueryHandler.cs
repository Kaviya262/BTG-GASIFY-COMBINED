using Core.OrderMng.SaleOrder;
using Core.Shared;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
 

namespace Application.Order.GetAllExportOrder
{
    public class GetAllExportOrderQueryHandler : IRequestHandler<GetAllExportOrderQuery, ExcelSheetItems>
    {
        private readonly ISaleOrderRepository _repository;
        ExcellSheet ES = new ExcellSheet();
        public GetAllExportOrderQueryHandler(ISaleOrderRepository repository)
        {
            _repository = repository;
        }
        public async Task<ExcelSheetItems> Handle(GetAllExportOrderQuery command, CancellationToken cancellationToken)
        {
            var Result = await _repository.GetAllExportAsync(command.customerid, command.from_date, command.to_date, command.BranchId, command.PO, command.FilterType);

            var data = await ES.DownloadSalesOrder(Result.GetType().GetProperty("Data")?.GetValue(Result));
            return data;
        }
    }
}







 