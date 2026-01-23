using BackEnd.FinanceModule.PettyCash;
using Core.Abstractions;
using Core.FinanceModule.PettyCash;
using Core.Models;
using Dapper;
using Newtonsoft.Json;
using System.Data;

namespace Infrastructure.Repositories
{
    public class PettyCashRepository : IPettyCashRepository
    {
        private readonly IDbConnection _connection;

        public PettyCashRepository(IUnitOfWorkDB3 financeDb)
        {
            _connection = financeDb.Connection;
        }

        public async Task<object> AddAsync(PettyCash obj)
        {
            try
            {

                var param = new DynamicParameters();
                param.Add("@opt", 1); // Add
                param.Add("@pettycash_id", 0);
                param.Add("@exptype", null);
                param.Add("voucher_no", null);
                param.Add("@orgid", obj.Header.OrgId);
                param.Add("@branchid", obj.Header.BranchId);
                param.Add("@user_id", obj.Header.userid);
                param.Add("@user_ip", obj.Header.CreatedIP);
                param.Add("@in_pettycash", JsonConvert.SerializeObject(new[] { obj.Header }));


                var result = await _connection.QueryFirstOrDefaultAsync<object>(
                    PettyCashBackEnd.PettyCashProcedure, param, commandType: CommandType.StoredProcedure);

                if (result == null)
                {
                    var updateDocParam = new DynamicParameters();
                    updateDocParam.Add("@opt", 7); // new case to update Doc_Number
                    updateDocParam.Add("@pettycash_id", 0);
                    updateDocParam.Add("@exptype", null);
                    updateDocParam.Add("voucher_no", null);
                    updateDocParam.Add("@orgid", obj.Header.OrgId);
                    updateDocParam.Add("@branchid", obj.Header.BranchId);
                    updateDocParam.Add("@user_id", obj.Header.userid);
                    updateDocParam.Add("@user_ip", obj.Header.CreatedIP);
                    updateDocParam.Add("@in_pettycash", null);

                    await _connection.ExecuteAsync(
                        PettyCashBackEnd.PettyCashProcedure,
                        updateDocParam,
                        commandType: CommandType.StoredProcedure);
                }

                return new ResponseModel
                {
                    Data = result,
                    Message = "Petty cash saved successfully",
                    Status = true
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Data = null,
                    Message = "Error saving petty cash: " + ex.Message,
                    Status = false
                };
            }
        }

        public async Task<object> UpdateAsync(PettyCash obj)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 2); // Update
                param.Add("@pettycash_id", obj.Header.PettyCashId);
                param.Add("@exptype", null);
                param.Add("voucher_no", null);
                param.Add("@orgid", obj.Header.OrgId);
                param.Add("@branchid", obj.Header.BranchId);
                param.Add("@user_id", obj.Header.userid);
                param.Add("@user_ip", obj.Header.ModifiedIP);
                param.Add("@in_pettycash", JsonConvert.SerializeObject(new[] { obj.Header }));


                var result = await _connection.QueryFirstOrDefaultAsync<object>(
                    PettyCashBackEnd.PettyCashProcedure, param, commandType: CommandType.StoredProcedure);

                return new ResponseModel
                {
                    Data = result,
                    Message = "Petty cash updated successfully",
                    Status = true
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Data = null,
                    Message = "Error updating petty cash: " + ex.Message,
                    Status = false
                };
            }
        }

        public async Task<object> GetByIdPettyCashAsync(int pettycashid, int branchid, int orgid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 3); // Get by ID
                param.Add("@pettycash_id", pettycashid);
                param.Add("@exptype", null);
                param.Add("voucher_no", null);
                param.Add("@orgid", orgid);
                param.Add("@branchid", branchid);
                param.Add("@user_id", 0);
                param.Add("@user_ip", "");
                param.Add("@in_pettycash", null);


                var result = await _connection.QueryMultipleAsync(
                    PettyCashBackEnd.PettyCashProcedure, param, commandType: CommandType.StoredProcedure);

                var header = await result.ReadFirstOrDefaultAsync<object>();

                return new ResponseModel
                {
                    Data = new { Header = header },
                    Message = "Success",
                    Status = true
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Data = null,
                    Message = "Error retrieving petty cash: " + ex.Message,
                    Status = false
                };
            }
        }

        public async Task<object> GetListPettyCashAsync(int pettycashid, string exptype, string voucherno, int branchid, int orgid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 3); // List
                param.Add("@pettycash_id", pettycashid);
                param.Add("@exptype", exptype);
                param.Add("@voucher_no", voucherno);
                param.Add("@orgid", orgid);
                param.Add("@branchid", branchid);
                param.Add("@user_id", 0);
                param.Add("@user_ip", "");
                param.Add("@in_pettycash", null);


                var result = await _connection.QueryAsync<object>(
                    PettyCashBackEnd.PettyCashProcedure, param, commandType: CommandType.StoredProcedure);

                return new ResponseModel
                {
                    Data = result,
                    Message = "Success",
                    Status = true
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Data = null,
                    Message = "Error retrieving petty cash list: " + ex.Message,
                    Status = false
                };
            }
        }

        public async Task<object> GetExpenseListAsync(int branchid, int orgid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 5); // List
                param.Add("@pettycash_id", 0);
                param.Add("@exptype", null);
                param.Add("voucher_no", null);
                param.Add("@orgid", orgid);
                param.Add("@branchid", branchid);
                param.Add("@user_id", 0);
                param.Add("@user_ip", "");
                param.Add("@in_pettycash", null);


                var result = await _connection.QueryAsync<object>(
                    PettyCashBackEnd.PettyCashProcedure, param, commandType: CommandType.StoredProcedure);

                return new ResponseModel
                {
                    Data = result,
                    Message = "Success",
                    Status = true
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Data = null,
                    Message = "Error retrieving Expense Description list: " + ex.Message,
                    Status = false
                };
            }
        }


        public async Task<object> GetSequencesNo(int branchId, int orgid, int userid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 6); // List
                param.Add("@pettycash_id", 0);
                param.Add("@exptype", null);
                param.Add("voucher_no", null);
                param.Add("@orgid", orgid);
                param.Add("@branchid", branchId);
                param.Add("@user_id", userid);
                param.Add("@user_ip", "");
                param.Add("@in_pettycash", null);

                var result = await _connection.QueryFirstOrDefaultAsync<object>(
                    PettyCashBackEnd.PettyCashProcedure,
                    param,
                    commandType: CommandType.StoredProcedure);

                return new ResponseModel
                {
                    Data = result,
                    Message = "Success",
                    Status = true
                };
            }
            catch (Exception Ex)
            {
                return new ResponseModel
                {
                    Data = null,
                    Message = "Error retrieving sequence number.",
                    Status = false
                };
            }
        }

    }

}
