using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Master.Currency;
using MediatR;
using static Core.Master.Currency.CurrencyItem;

namespace Application.Master.CurrencyItem.CreateCurrencyItem
{
    public class CreateCurrencyItemCommand : IRequest<object>
    {
        public CurrencyItemHeader Header { get; set; }
    }
}
