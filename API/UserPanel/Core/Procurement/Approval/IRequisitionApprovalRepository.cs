using Core.Finance.Approval;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Procurement.Approval
{
 public interface  IRequisitionApprovalRepository
    {
        Task<object> GetAllAsync(int Id, int branchId, Int32 orgid, int userid);
        Task<object> ApproveAsync(RequisitionApprovalHdr obj);
        Task<object> GetRemarksList(int prid);

        Task<object> GetHistoryAsync(int id, int userid, int branchId, Int32 orgid, string fromdate, string todate);
    }
}
