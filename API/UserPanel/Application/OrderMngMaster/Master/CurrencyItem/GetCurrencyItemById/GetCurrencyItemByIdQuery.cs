using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;
using static Core.Master.Currency.CurrencyItem;

namespace Application.Master.CurrencyItem.GetCurrencyItemById
{
    public class GetCurrencyItemByIdQuery : IRequest<object>
    {
        public CurrencyItemHeader Header {  get; set; }
        public int Id {  get; set; }  
        public string CurCode { get; set; }
        public string CurName { get; set; }
    }
}
