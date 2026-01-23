using BackEnd.FinanceModule.OverDraft;
using Core.Abstractions;
using Core.FinanceModule.OverDraft;
using Core.Models;
using Dapper;
using Newtonsoft.Json;
using System.Data;

namespace Infrastructure.Repositories
{
    public class OverDraftRepository : IOverDraftRepository
    {
        private readonly IDbConnection _connection;

        public OverDraftRepository(IUnitOfWorkDB3 financeDb)
        {
            _connection = financeDb.Connection;
        }

        // 🔹 Add OverDraft
        public async Task<object> AddAsync(OverDraftModel obj)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 1);
                param.Add("@orgid", obj.Header.OrgId);
                param.Add("@branchid", obj.Header.BranchId);
                param.Add("@user_id", obj.Header.userid);
                param.Add("@in_overdraft", JsonConvert.SerializeObject(new[] { obj.Header }));
                param.Add("@overdraft_id", 0);
                param.Add("@overdrafttype", null);
                param.Add("@voucher_no", null);

                var result = await _connection.QueryFirstOrDefaultAsync<object>(
                    OverDraftBackEnd.OverDraftProcedure,
                    param,
                    commandType: CommandType.StoredProcedure
                );

                // Update Doc Number if insert succeeds
                var updateDocParam = new DynamicParameters();
                updateDocParam.Add("@opt", 6);
                updateDocParam.Add("@orgid", obj.Header.OrgId);
                updateDocParam.Add("@branchid", obj.Header.BranchId);
                updateDocParam.Add("@user_id", obj.Header.userid);
                updateDocParam.Add("@in_overdraft", null);
                updateDocParam.Add("@overdraft_id", 0);
                updateDocParam.Add("@overdrafttype", null);
                updateDocParam.Add("@voucher_no", null);

                await _connection.ExecuteAsync(
                    OverDraftBackEnd.OverDraftProcedure,
                    updateDocParam,
                    commandType: CommandType.StoredProcedure
                );

                return new ResponseModel
                {
                    Data = result,
                    Message = "Overdraft saved successfully",
                    Status = true
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Data = null,
                    Message = "Error saving overdraft: " + ex.Message,
                    Status = false
                };
            }
        }

        // 🔹 Update OverDraft
        public async Task<object> UpdateAsync(OverDraftModel obj)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 2);
                param.Add("@orgid", obj.Header.OrgId);
                param.Add("@branchid", obj.Header.BranchId);
                param.Add("@user_id", obj.Header.userid);
                param.Add("@in_overdraft", JsonConvert.SerializeObject(new[] { obj.Header }));
                param.Add("@overdraft_id", obj.Header.OverDraftId);
                param.Add("@overdrafttype", null);
                param.Add("@voucher_no", null);

                var result = await _connection.QueryFirstOrDefaultAsync<object>(
                    OverDraftBackEnd.OverDraftProcedure,
                    param,
                    commandType: CommandType.StoredProcedure
                );

                return new ResponseModel
                {
                    Data = result,
                    Message = "Overdraft updated successfully",
                    Status = true
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Data = null,
                    Message = "Error updating overdraft: " + ex.Message,
                    Status = false
                };
            }
        }

        // 🔹 Get List of OverDraft
        public async Task<object> GetListOverDraftAsync(int overdraftid, string overdrafttype, string voucherno, int branchid, int orgid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 3);
                param.Add("@orgid", orgid);
                param.Add("@branchid", branchid);
                param.Add("@user_id", 0);
                param.Add("@in_overdraft", null);
                param.Add("@overdraft_id", overdraftid);
                param.Add("@overdrafttype", overdrafttype);
                param.Add("@voucher_no", voucherno);

                var result = await _connection.QueryAsync<object>(
                    OverDraftBackEnd.OverDraftProcedure,
                    param,
                    commandType: CommandType.StoredProcedure
                );

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
                    Message = "Error retrieving overdraft list: " + ex.Message,
                    Status = false
                };
            }
        }

        // 🔹 Get Single OverDraft by ID
        public async Task<object> GetByIdOverDraftAsync(int overdraftid, int branchid, int orgid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 3);
                param.Add("@orgid", orgid);
                param.Add("@branchid", branchid);
                param.Add("@user_id", 0);
                param.Add("@in_overdraft", null);
                param.Add("@overdraft_id", overdraftid);
                param.Add("@overdrafttype", null);
                param.Add("@voucher_no", null);

                var result = await _connection.QueryMultipleAsync(
                    OverDraftBackEnd.OverDraftProcedure,
                    param,
                    commandType: CommandType.StoredProcedure
                );

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
                    Message = "Error retrieving overdraft: " + ex.Message,
                    Status = false
                };
            }
        }

        // 🔹 Get Voucher Sequence Number
        public async Task<object> GetSequencesNo(int branchid, int orgid, int userid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 5);
                param.Add("@orgid", orgid);
                param.Add("@branchid", branchid);
                param.Add("@user_id", userid);
                param.Add("@in_overdraft", null);
                param.Add("@overdraft_id", 0);
                param.Add("@overdrafttype", null);
                param.Add("@voucher_no", null);

                var result = await _connection.QueryFirstOrDefaultAsync<object>(
                    OverDraftBackEnd.OverDraftProcedure,
                    param,
                    commandType: CommandType.StoredProcedure
                );

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
                    Message = "Error retrieving voucher number: " + ex.Message,
                    Status = false
                };
            }
        }

        // 🔹 Delete (Soft Delete)
        public async Task<object> DeleteAsync(int overdraftid, int branchid, int orgid, int userid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 4);
                param.Add("@orgid", orgid);
                param.Add("@branchid", branchid);
                param.Add("@user_id", userid);
                param.Add("@in_overdraft", null);
                param.Add("@overdraft_id", overdraftid);
                param.Add("@overdrafttype", null);
                param.Add("@voucher_no", null);

                await _connection.ExecuteAsync(
                    OverDraftBackEnd.OverDraftProcedure,
                    param,
                    commandType: CommandType.StoredProcedure
                );

                return new ResponseModel
                {
                    Data = null,
                    Message = "Overdraft deleted successfully",
                    Status = true
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Data = null,
                    Message = "Error deleting overdraft: " + ex.Message,
                    Status = false
                };
            }
        }
    }
}
