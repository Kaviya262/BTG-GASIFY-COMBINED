using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Procurement.GoodsReceiptNote
{
    public interface IGoodsReceiptNoteRepository
    {
        Task<object> GetByGRNNoSeqAsync(int branchid, int orgid);
        Task<object> GetPOSupplierListAsync(int branchid, int orgid,int grnid);

        Task<object> GetPoItemList(int poId, int orgId, int branchId, Int32 grnid);

        Task<object> GetPOListAsync(int supplierid, int branchid, int orgid, int grnid);
        Task<object> AddAsync(GoodsReceiptNote obj);
        Task<object> UpdateAsync(GoodsReceiptNote obj);
        Task<object> GetAllGRNAsync(int supplierid, int grnNo, int orgid, int branchid,int userid);
        Task<object> GetGoodsReceiptNoteByIdAsync(int grnid, int branchid, int orgid);

        Task<object> GetGrnSupplierAutocomplete(int branchid, int orgid, string suppliername);
        Task<object> GetGrnNoAutoComplete(int branchid, int orgid, string grnno);
    }
}
