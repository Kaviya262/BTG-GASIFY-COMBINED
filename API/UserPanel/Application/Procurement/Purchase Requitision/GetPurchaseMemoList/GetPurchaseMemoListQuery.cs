using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Purchase_Requitision.GetPurchaseMemoList
{
    public class GetPurchaseMemoListQuery : IRequest<object>
    {
        public int id { get; set; }
        public int orgid { get; set; }
        public int branchid { get; set; }
    }
}
