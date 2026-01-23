using Application.FinanceModule.Report.GetListCashBook;
using Core.FinanceModule.Report;
using MediatR;

namespace Application.FinanceModule.CashBook.GetListCashBook
{
    public class GetListCashBookQueryHandler : IRequestHandler<GetListCashBookQuery, object>
    {
        private readonly ICashBookRepository _repository;

        public GetListCashBookQueryHandler(ICashBookRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetListCashBookQuery query, CancellationToken cancellationToken)
        {
            var from = query.FromDate ?? new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1);
            var to = query.ToDate ?? DateTime.Today;
            var list = await _repository.GetListCashBookAsync(from, to, query.BranchId, query.OrgId);
            return list;

        }
    }
}
