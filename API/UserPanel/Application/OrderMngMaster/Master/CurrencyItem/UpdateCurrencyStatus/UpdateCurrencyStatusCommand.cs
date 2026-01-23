using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;
using static Core.Master.Currency.CurrencyItem;

namespace Application.OrderMngMaster.Master.CurrencyItem.UpdateCurrencyStatus
{
    public class UpdateCurrencyStatusCommand :IRequest<object>
    {
        public CurrencyItemStatus Detail { get; set; }
        public int currencyId { get; set; }
    }
}
