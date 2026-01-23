using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace Application.PackingAndDO.GetAllPackingItems
{
    public class GetAllPackingItemsQuery : IRequest<object>
    {
        public int sys_sqnbr;

        public int packingid { get; set; }


        public string from_date { get; set; }
        public string to_date { get; set; }
        public Int32 BranchId { get; set; }
        public Int32 GasCodeId { get; set; }
        public Int32  customerid { get; set; }
        public string esttime { get; set; }
        public Int32 packerid { get; set; }
    }
}





