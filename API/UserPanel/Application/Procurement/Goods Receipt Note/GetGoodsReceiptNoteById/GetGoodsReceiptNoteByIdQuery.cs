using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace Application.Procurement.Goods_Receipt_Note.GetGoodsReceiptNoteById
{
    public class GetGoodsReceiptNoteByIdQuery : IRequest<object>
    {
        public Int32 Id { get; set; }
        public Int32 branchid { get; set; }
        public Int32 orgid { get; set; }
    }
}
