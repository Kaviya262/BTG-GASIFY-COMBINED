using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Master.Common
{
    public class CreatePurchaseCommonMasterCommand : IRequest<object>
    {
       
        public Int32 opt { get; set; }
        public Int32 branchid { get; set; }
        public string searchtext { get; set; }
        public Int32 orgid { get; set; }
        public Int32 pmid { get; set; }
        public Int32 prid { get; set; }
        public Int32 Id { get; set; }
        public Int32 groupid { get; set; }


    }


}
