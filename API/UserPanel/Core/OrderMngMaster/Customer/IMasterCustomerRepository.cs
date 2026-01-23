using Core.Models;
using Core.OrderMng.Quotation;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.OrderMngMaster.Customer
{
    public interface IMasterCustomerRepository
    {
        Task<ResponseModel> UploadDO(int Id, string Path, int userId, int branchId);
        Task<object> AddAsync(MasterCustomerModel item);
        Task<object> GetByID(int customerld, int tabld, int branchid);
        Task<object> GetAllAsync(int tabld, int customerld, int contactid, int branchid, int userId,int addressId,CancellationToken cancellationToken);
        Task<object> ToogleStatus(MasterCustomer item);
        Task<object> GetAllCustomerAsync(string name, int branchId, int userId, int customerId,int contactId,int addressId);
    }
}
