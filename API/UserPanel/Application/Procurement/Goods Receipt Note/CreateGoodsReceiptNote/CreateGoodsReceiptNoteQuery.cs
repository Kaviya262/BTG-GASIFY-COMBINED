using Core.Procurement.GoodsReceiptNote;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Goods_Receipt_Note.CreateGoodsReceiptNote
{
    public class CreateGoodsReceiptNoteQuery : IRequest<object>
    {
        public GoodsReceiptNoteHeader Header { get; set; }
        public List<GoodsReceiptNoteDetail> Details { get; set; }

    }
}
