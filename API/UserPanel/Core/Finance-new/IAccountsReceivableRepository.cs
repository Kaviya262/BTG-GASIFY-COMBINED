using Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Finance_new
{
   public  interface IAccountsReceivableRepository
    {
        Task<object> InsertFromInvoiceAsync(int orgId, int branchId,
                                               int userId, string userIp,
                                               int invoiceId,int typeid);
        Task<object> UpdateReceiptsAsync(int orgId, int branchId,
                                                int userId, string userIp,
                                                IEnumerable<ArReceiptInput> receipts);
        Task<object> GetByCustomerAsync(int orgId, int branchId,
                                               int? customerId = null);

        Task<object> getARBook(int orgId, int branchId,int? customerId = null,DateTime? from_date=null, DateTime? to_date = null);
    }
}
