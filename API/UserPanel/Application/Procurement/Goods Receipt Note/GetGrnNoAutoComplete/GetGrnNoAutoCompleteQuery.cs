using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Goods_Receipt_Note.GetGrnNoAutoComplete
{
    public class GetGrnNoAutoCompleteQuery : IRequest<object>
    {
        public int branchid { get; set; }
        public int orgid { get; set; }
        public string grnno { get; set; }
    }
}
