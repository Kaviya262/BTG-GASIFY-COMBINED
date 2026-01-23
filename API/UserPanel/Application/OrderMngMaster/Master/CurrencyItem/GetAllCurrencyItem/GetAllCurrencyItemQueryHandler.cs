using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Master.CurrencyItem.CreateCurrencyItem;
using Core.Master.Currency;
using static Core.Master.Currency.CurrencyItem;
using UserPanel.Core.Abstractions;
using MediatR;
using Core.Abstractions;

namespace Application.Master.CurrencyItem.GetAllCurrencyItem
{
    public class GetAllCurrencyItemQueryHandler : IRequestHandler<GetAllCurrencyItemQuery, object>
    {
        private readonly ICurrencyRepository _repository;
        private readonly IUnitOfWorkDB1 _unitOfWork;

        public GetAllCurrencyItemQueryHandler(ICurrencyRepository repository, IUnitOfWorkDB1 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }
        #region Handle
        public async Task<object> Handle(GetAllCurrencyItemQuery command, CancellationToken cancellationToken)
        {
            var currencyItems = new CurrencyItemMain
            {
                Header = command.Header
            };
            int opt = 1;
            int Id = 0;
            var data = await _repository.GetAllCurrenciesAsync(opt, Id,command.Curcode, command.CurName);
            _unitOfWork.Commit();
            return data;

        }
        #endregion

    }
}
