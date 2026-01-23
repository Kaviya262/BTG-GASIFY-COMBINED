using BackEnd.Master;
using BackEnd.Procurement;
using Core.Abstractions;
using Core.Models;
using Core.Procurement.Master;
using Dapper;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
   public class PurchaseMasterRepository: IPurchaseMasterRepository
    {
        private readonly IDbConnection _connection;

        public PurchaseMasterRepository(IUnitOfWorkDB2 unitOfWork)
        {
            _connection = unitOfWork.Connection;
        }

        public async Task<object> GetUserDetails(Int32 branchid,string Searchtext,int orgid,int id)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 1);
                param.Add("@branchid", branchid);
                param.Add("@searchtext", Searchtext);
                param.Add("@pmid", 0);
                param.Add("@prid", 0);
                param.Add("@orgid", orgid);
                param.Add("@id", id);
                param.Add("@groupid", 0);
                var List = await _connection.QueryAsync(Procurementmaster.ProcurementmasterProcedure, param: param, commandType: CommandType.StoredProcedure);
                var Modellist = List.ToList();
                return new ResponseModel()
                {
                    Data = Modellist,
                    Message = "Success",
                    Status = true
                };
            }
            catch (Exception Ex)
            {
                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went wrong",
                    Status = false
                };
            }
        }
        public async Task<object> GetDepartMentDetails(Int32 branchid, string Searchtext, int orgid, int id)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 2);
                param.Add("@branchid", branchid);
                param.Add("@searchtext", Searchtext);
                param.Add("@pmid", 0);
                param.Add("@prid", 0);
                param.Add("@orgid", orgid);
                param.Add("@id", id);
                param.Add("@groupid", 0);

                var List = await _connection.QueryAsync(Procurementmaster.ProcurementmasterProcedure, param: param, commandType: CommandType.StoredProcedure);
                var Modellist = List.ToList();
                return new ResponseModel()
                {
                    Data = Modellist,
                    Message = "Success",
                    Status = true
                };
            }
            catch (Exception Ex)
            {
                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went wrong",
                    Status = false
                };
            }
        }
        public async Task<object> GetPurchaseTypeDetails(Int32 branchid, string Searchtext, int orgid, int id)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 3);
                param.Add("@branchid", branchid);
                param.Add("@searchtext", Searchtext);
                param.Add("@pmid", 0);
                param.Add("@prid", 0);
                param.Add("@orgid", orgid);
                param.Add("@id", id);
                param.Add("@groupid", 0);

                var List = await _connection.QueryAsync(Procurementmaster.ProcurementmasterProcedure, param: param, commandType: CommandType.StoredProcedure);
                var Modellist = List.ToList();
                return new ResponseModel()
                {
                    Data = Modellist,
                    Message = "Success",
                    Status = true
                };
            }
            catch (Exception Ex)
            {
                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went wrong",
                    Status = false
                };
            }
        }
        public async Task<object> GetUomDetails(Int32 branchid, string Searchtext, int orgid, int id)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 4);
                param.Add("@branchid", branchid);
                param.Add("@searchtext", Searchtext);
                param.Add("@pmid", 0);
                param.Add("@prid", 0);
                param.Add("@orgid", orgid);
                param.Add("@id", id);
                param.Add("@groupid", 0);
                var List = await _connection.QueryAsync(Procurementmaster.ProcurementmasterProcedure, param: param, commandType: CommandType.StoredProcedure);
                var Modellist = List.ToList();
                return new ResponseModel()
                {
                    Data = Modellist,
                    Message = "Success",
                    Status = true
                };
            }
            catch (Exception Ex)
            {
                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went wrong",
                    Status = false
                };
            }
        }
        public async Task<object> GetItemDetails(Int32 branchid, string Searchtext, int orgid, int id,int groupid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 5);
                param.Add("@branchid", branchid);
                param.Add("@searchtext", Searchtext);
                param.Add("@pmid", 0);
                param.Add("@prid", 0);
                param.Add("@orgid", orgid);
                param.Add("@id", id);
                param.Add("@groupid", groupid);
                

                var List = await _connection.QueryAsync(Procurementmaster.ProcurementmasterProcedure, param: param, commandType: CommandType.StoredProcedure);
                var Modellist = List.ToList();
                return new ResponseModel()
                {
                    Data = Modellist,
                    Message = "Success",
                    Status = true
                };
            }
            catch (Exception Ex)
            {
                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went wrong",
                    Status = false
                };
            }
        }

        public async Task<object> GetItemGroup(Int32 branchid, string Searchtext, int orgid, int id)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 10);
                param.Add("@branchid", branchid);
                param.Add("@searchtext", Searchtext);
                param.Add("@pmid", 0);
                param.Add("@prid", 0);
                param.Add("@orgid", orgid);
                param.Add("@id", id);
                param.Add("@groupid", 0);

                var List = await _connection.QueryAsync(Procurementmaster.ProcurementmasterProcedure, param: param, commandType: CommandType.StoredProcedure);
                var Modellist = List.ToList();
                return new ResponseModel()
                {
                    Data = Modellist,
                    Message = "Success",
                    Status = true
                };
            }
            catch (Exception Ex)
            {
                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went wrong",
                    Status = false
                };
            }
        }
        public async Task<object> GetPRType(Int32 branchid, string Searchtext, int orgid, int id)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 6);
                param.Add("@branchid", branchid);
                param.Add("@searchtext", Searchtext);
                param.Add("@pmid", 0);
                param.Add("@prid", 0);
                param.Add("@orgid", orgid);
                param.Add("@id", id);
                param.Add("@groupid", 0);

                var List = await _connection.QueryAsync(Procurementmaster.ProcurementmasterProcedure, param: param, commandType: CommandType.StoredProcedure);
                var Modellist = List.ToList();
                return new ResponseModel()
                {
                    Data = Modellist,
                    Message = "Success",
                    Status = true
                };
            }
            catch (Exception Ex)
            {
                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went wrong",
                    Status = false
                };
            }
        }
        public async Task<object> GetSupplierDetails(Int32 branchid, string Searchtext, int orgid, int id)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 7);
                param.Add("@branchid", branchid);
                param.Add("@searchtext", Searchtext);
                param.Add("@pmid", 0);
                param.Add("@prid", 0);
                param.Add("@orgid", orgid);
                param.Add("@id", id);
                param.Add("@groupid", 0);

                var List = await _connection.QueryAsync(Procurementmaster.ProcurementmasterProcedure, param: param, commandType: CommandType.StoredProcedure);
                var Modellist = List.ToList();
                return new ResponseModel()
                {
                    Data = Modellist,
                    Message = "Success",
                    Status = true
                };
            }
            catch (Exception Ex)
            {
                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went wrong",
                    Status = false
                };
            }
        }

        public async Task<object> GetPOSupplierDetails(Int32 branchid, string Searchtext, int orgid, int id)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 13);
                param.Add("@branchid", branchid);
                param.Add("@searchtext", Searchtext);
                param.Add("@pmid", 0);
                param.Add("@prid", 0);
                param.Add("@orgid", orgid);
                param.Add("@id", id);
                param.Add("@groupid", 0);

                var List = await _connection.QueryAsync(Procurementmaster.ProcurementmasterProcedure, param: param, commandType: CommandType.StoredProcedure);
                var Modellist = List.ToList();
                return new ResponseModel()
                {
                    Data = Modellist,
                    Message = "Success",
                    Status = true
                };
            }
            catch (Exception Ex)
            {
                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went wrong",
                    Status = false
                };
            }
        }
        public async Task<object> GetPaymentTermsDetails(Int32 branchid, string Searchtext, int orgid, int id)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 8);
                param.Add("@branchid", branchid);
                param.Add("@searchtext", Searchtext);
                param.Add("@pmid", 0);
                param.Add("@prid", 0);
                param.Add("@orgid", orgid);
                param.Add("@id", id);
                param.Add("@groupid", 0);


                var List = await _connection.QueryAsync(Procurementmaster.ProcurementmasterProcedure, param: param, commandType: CommandType.StoredProcedure);
                var Modellist = List.ToList();
                return new ResponseModel()
                {
                    Data = Modellist,
                    Message = "Success",
                    Status = true
                };
            }
            catch (Exception Ex)
            {
                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went wrong",
                    Status = false
                };
            }
        }
        public async Task<object> GetDeliveryTermsDetails(Int32 branchid, string Searchtext, int orgid, int id)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 9);
                param.Add("@branchid", branchid);
                param.Add("@searchtext", Searchtext);
                param.Add("@pmid", 0);
                param.Add("@prid", 0);
                param.Add("@orgid", orgid);
                param.Add("@id", id);
                param.Add("@groupid", 0);


                var List = await _connection.QueryAsync(Procurementmaster.ProcurementmasterProcedure, param: param, commandType: CommandType.StoredProcedure);
                var Modellist = List.ToList();
                return new ResponseModel()
                {
                    Data = Modellist,
                    Message = "Success",
                    Status = true
                };
            }
            catch (Exception Ex)
            {
                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went wrong",
                    Status = false
                };
            }
        }
    }
}
