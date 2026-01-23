using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.OrderMng.SaleOrder;
using MediatR;

namespace Application.Barcode.DeleteBarcode
{
    public  class DeleteBarcodeItemCommand : IRequest<object>
    {
        public int BarcodeDtlid { get; set; }
        public int PackingId { get; set; }


    }
}
