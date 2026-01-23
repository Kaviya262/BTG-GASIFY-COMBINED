using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Purchase_Requitision.GetSupplierCurrency
{
    public class GetSupplierCurrencyQuery : IRequest<object>
    {
        public int supplierid { get; set; }
        public int orgid { get; set; }
    }
}
