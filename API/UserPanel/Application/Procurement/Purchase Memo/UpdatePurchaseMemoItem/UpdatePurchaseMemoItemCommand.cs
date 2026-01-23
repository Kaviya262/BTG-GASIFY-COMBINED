using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Application.Procurement.Purchase_Memo.CreatePurchaseMemoItem;
using Core.Procurement.PurchaseMemo;
using MediatR;

namespace Application.Procurement.Purchase_Memo.UpdatePurchaseMemoItem
{
    public class UpdatePurchaseMemoItemCommand : IRequest<object>
    {
        public PurchaseMemoHeader Header { get; set; }
        public List<PurchaseMemoDetail> Details { get; set; }

    }
}

