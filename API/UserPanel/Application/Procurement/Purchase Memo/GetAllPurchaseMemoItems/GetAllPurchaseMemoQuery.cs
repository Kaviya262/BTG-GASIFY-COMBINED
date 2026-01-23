
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace Application.Procurement.Purchase_Memo.GetAllPurchaseMemoItems
{
    public class GetAllPurchaseMemoQuery : IRequest<object>
    {

        public int requesterid { get; set; }
        public Int32 BranchId { get; set; }
        public Int32 OrgId { get; set; }
        public string pmnumber { get; set; }
        public Int32 userid { get; set; }
    }
}


