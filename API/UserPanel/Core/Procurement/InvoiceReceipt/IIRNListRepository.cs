using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Procurement.InvoiceReceipt
{
    public interface IIRNListRepository
    {
        Task<object> GetAllIRNL(int branchid, int orgid, int supplierid, string fromdate, string todate, int irnid,int userid);
        Task<object> GetAllSupplierIRNList(int branchid, int orgid);
        Task<object> getIRNById(int irnid, int branchid, int orgid);
        Task<object> GetPaymentHistory(int branchid, int orgid, int supplierid, string fromdate, string todate);
    }
}
