using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace Application.Procurement.Goods_Receipt_Note.GetAllGoodsReceiptNote
{
    public class GetAllGoodsReceiptNoteQuery : IRequest<object>
    {
        public int supplierId { get; set; }
        public int grnid { get; set; }
        public Int32 BranchId { get; set; }
        public Int32 OrgId { get; set; }
        public int userid { get; set; }
    }
}
