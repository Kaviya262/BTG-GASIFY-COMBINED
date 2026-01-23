using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.OrderMng.Barcode
{
    public interface IBarcodeRepository
    {
        Task<object> OptBarcodeScan(int PackingId);
        Task<object> SaveBarcodeScan(int PackingId,int rackid);
        Task<object> DeleteBarcode(int PackingId, int BarcodeDtlid);
    }
}
