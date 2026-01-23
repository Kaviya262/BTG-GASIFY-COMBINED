 
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Procurement.PurchaseMemo
{
    public interface IPurchaseMemoRepository
    {
        Task<object> DeleteMemo(InActiveMemo obj);
        Task<object> AddAsync(PurchaseMemo Obj);
        Task<object> UploadDocument(List<MemoAttachment> list);
        Task<object> UpdateAsync(PurchaseMemo Obj);
        Task<object> GetByIdAsync(int pmid, int OrgId);
        Task<object> GetAllAsync(Int32 requesterid, Int32 BranchId,Int32 OrgId,string pmnumber,int userid);
        Task<object> GetBySeqNoAsync(int unit,int OrgId);
    }
}
