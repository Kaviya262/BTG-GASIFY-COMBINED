using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;
using static Core.Master.Currency.CurrencyItem;

namespace Application.Master.CurrencyItem.UpdateCurrencyItem
{
    public class UpdateCurrencyItemCommand : IRequest<object>
    {
        public CurrencyItemHeader Header { get; set; }
       
        public int currencyId { get; set; }

        
    }
}
