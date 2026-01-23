using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Master.Item.GetAllItem
{
    public class GetAllItemQuery : IRequest<object>
    {
        public int branchid { get; set; }
        public int orgid { get; set; }
        public int itemid { get; set; }
        public string itemcode { get; set; }
        public string itemname { get; set; }
        public int groupid { get; set; }
        public int categoryid { get; set; }
    }
}
