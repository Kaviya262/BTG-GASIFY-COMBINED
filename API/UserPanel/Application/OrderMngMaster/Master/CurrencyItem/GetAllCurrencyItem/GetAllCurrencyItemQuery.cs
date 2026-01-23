using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;
using Core.Master.Currency;
using static Core.Master.Currency.CurrencyItem;
using System.Diagnostics.CodeAnalysis;
using Org.BouncyCastle.Asn1.X509.Qualified;

namespace Application.Master.CurrencyItem.GetAllCurrencyItem
{
    public class GetAllCurrencyItemQuery : IRequest<object>
    {
        public CurrencyItemHeader Header { get; set; }
        public string Curcode { get; set; }
        public string CurName { get; set; }
    }
}
