using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace Application.Procurement.Purchase_Memo.GetPurchaseMemoSeqNo
{
    public class GetPurchaseMemoSeqNoQuery : IRequest<object>
    {

        public Int32 BranchId { get; set; }
        public Int32 OrgId { get; set; }
    }
}
