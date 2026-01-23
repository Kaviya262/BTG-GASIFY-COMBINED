using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Procurement.GoodsReceiptNote;
using MediatR;

namespace Application.Procurement.Goods_Receipt_Note.UpdateGoodsReceiptNote
{
    public class UpdateGoodsReceiptNoteQuery : IRequest<object>
    {
        public GoodsReceiptNoteHeader Header { get; set; }
        public List<GoodsReceiptNoteDetail> Details { get; set; }

}
}
