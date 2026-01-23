using Application.Order.PrintOrder;
using Core.OrderMng.SaleOrder;
using Core.Shared;
using MediatR;


namespace Application.Order.GetAllExportOrder
{
    public class PrintOrderHandler : IRequestHandler<PrintOrderQuery, ExcelSheetItems>
    {
        private readonly ISaleOrderRepository _repository;
        ExcellSheet ES = new ExcellSheet();
        public PrintOrderHandler(ISaleOrderRepository repository)
        {
            _repository = repository;
        }
        public async Task<ExcelSheetItems> Handle(PrintOrderQuery command, CancellationToken cancellationToken)
        {
            var Result = await _repository.GetAllExportAsync(command.customerid, command.from_date, command.to_date, command.BranchId, command.PO, command.FilterType);

            var data = await ES.PrintSalesOrder(Result.GetType().GetProperty("Data")?.GetValue(Result));
            return data;
        }
    }
}







