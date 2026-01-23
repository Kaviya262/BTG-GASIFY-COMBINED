using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace Application.Procurement.Purchase_Memo.GetPurchaseMemoItem
{
    public class GetPurchaseMemoByIdQuery : IRequest<object>
    {

        public Int32 Id { get; set; }
        public Int32 OrgId { get; set; }
    }
}

