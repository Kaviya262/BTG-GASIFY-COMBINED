using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Master.Item;

namespace Core.Master.Claim
{
    public interface IClaimDescriptionRepository
    {
        Task<object> GetAllCategory(int branchid, int orgid);
        Task<object> GetAllCategorytypes(int branchid, int orgid, int typeid);
        Task<object> AddAsync(ClaimDescriptionPayment item);
        Task<object> UpdateAsync(ClaimDescriptionPayment item);
        Task<object> GetClaimDescriptionByIdAsync(int opt, int typeid);
        Task<object> GetPaymentDescriptionList(int branchid, int orgid);
        Task<object> DescriptionstatusChange(int paymentid);
        Task<object> searchbyCategory(int branchid, int orgid, int categoryid, int claimtypeid);
    }
}
