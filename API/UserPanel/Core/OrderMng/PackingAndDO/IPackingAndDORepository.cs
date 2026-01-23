using Core.Models;
using Core.OrderMng.ProductionOrder;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.OrderMng.PackingAndDO
{
    public interface IPackingAndDORepository
   {
      Task<object> DownloadDO(int Id);
      Task<ResponseModel> UploadDO(int Id, string Path, DataSet DS);
        Task<object> GetAllAsync(Int32 packingid, string from_date, string to_date, Int32 BranchId,Int32 GasCodeId, int customerid, string esttime,int packerid);
        Task<object> GetByPackNoAsync(int BranchId);
        Task<object> AddAsync(PackingAndDOItems item);
        Task<object> GetByIdAsync(int orderid);
        Task<object> UpdateAsync(PackingAndDOItems item);
        Task<object> UploadACK(int Id, string Path, string Filename, int userid);
        Task<bool> IsDogenerated(int packid);
        Task<object> GetAllExportAsync(Int32 packerid, string from_date, string to_date, Int32 BranchId,Int32 GasCodeId,int customerid, string esttime, int packer_id);
        Task<object> ChangePackingStage(int packingId, int stageId, int branchId);

        Task<object> packingacknoledgement(List<packingacknowledgement> obj,Int32 UserId);

        Task<object> GetInvoiceData(int packid);
        Task<object> GenerateInvoice(Int32 PackingId, string DOID);
        Task<object> BarcodeMachineScan(Int32 PackingId, Int32 UserId);
        Task<object> PackingConfirmed(Int32 PackingId, Int32 UserId,int rackid);
        Task<object> docprint(Int32 doid);
    }
}
