using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Master.Item.UpdateItemStatus
{
    public  class UpdateItemStatusCommand : IRequest<object>
    {
        public int branchid { get; set; }
        public int orgid { get; set; }
        public int itemid { get; set; }
        public bool isactive { get; set; }
        public int userid { get; set; }

    }
}
