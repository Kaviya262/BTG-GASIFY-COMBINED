using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Procurement.PurchaseMemo;
using MediatR;

namespace Application.Procurement.Purchase_Memo.CreatePurchaseMemoItem
{
    public class CreatePurchaseMemoCommand : IRequest<object>
    {
        public PurchaseMemoHeader Header { get; set; }
        public List<PurchaseMemoDetail> Details { get; set; }
    }
}

