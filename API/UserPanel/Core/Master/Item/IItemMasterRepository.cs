using Core.Master.Supplier;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Master.Item
{
    public interface IItemMasterRepository
    {
        Task<object> GetAllAsync(int branchid, int orgid, int itemid, string itemcode, string itemname,int groupid, int categoryid);

        Task<object> AddAsync(ItemMaster item);

        Task<object> UpdateAsync(ItemMaster item);

        Task<object> GetItemCategoryList(int branchid, int orgid);
        Task<object> GetItemGroupList(int branchid, int orgid);
        Task<object> GetUOMList(int branchid, int orgid);

        Task<object> GetItemCodeList(int branchid, int orgid);

        Task<object> GetItemNameList(int branchid, int orgid);

        Task<object> UpdateItemStatus(int branchid, int orgid,int itemid,bool isactive,int userid);
        Task<object> UpdateActiveateAsync(int itemid, bool isactive);

        Task<object> GetItemcodeSeqId(int branchid, int orgid);
    }
}
