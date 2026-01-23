using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.OrderMng.Quotation;

namespace Core.OrderMng.Invoices
{
    public interface IInvoicesRepository
    {


        Task<object> AddAsync(InvoiceItemMain item);


        Task<object> UpdateAsync(InvoiceItemMain item);




        Task<object> GetByIdAsync(int id);


        Task<object> GetAllAsync(Int32 customerid, string from_date, string to_date, Int32 BranchId, int typeid );



        Task<object> GetBySiNoAsync(int branchid,int typeid);

    }
}

