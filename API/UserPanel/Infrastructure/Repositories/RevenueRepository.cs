using BackEnd.FinanceModule.Revenue;
using Core.Abstractions;
using Core.FinanceModule.Revenue;
using Core.Models;
using Dapper;
using Newtonsoft.Json;
using System.Data;

namespace Infrastructure.Repositories
{
    public class RevenueRepository : IRevenueRepository
    {
        private readonly IDbConnection _connection;

        public RevenueRepository(IUnitOfWorkDB3 financeDb)
        {
            _connection = financeDb.Connection;
        }

        public async Task<object> AddAsync(RevenueModel obj)
        {
            try
            {

                var param = new DynamicParameters();
                param.Add("@opt", 1); // Add
                param.Add("@revenue_id", 0);
                param.Add("@revenuetype", null);
                param.Add("voucher_no", null);
                param.Add("@orgid", obj.Header.OrgId);
                param.Add("@branchid", obj.Header.BranchId);
                param.Add("@user_id", obj.Header.userid);
                param.Add("@user_ip", obj.Header.CreatedIP);
                param.Add("@in_revenue", JsonConvert.SerializeObject(new[] { obj.Header }));


                var result = await _connection.QueryFirstOrDefaultAsync<object>(
                    RevenueBackEnd.RevenueProcedure, param, commandType: CommandType.StoredProcedure);

                if (result == null)
                {
                    var updateDocParam = new DynamicParameters();
                    updateDocParam.Add("@opt", 7); // new case to update Doc_Number
                    updateDocParam.Add("@revenue_id", 0);
                    updateDocParam.Add("@revenuetype", null);
                    updateDocParam.Add("voucher_no", null);
                    updateDocParam.Add("@orgid", obj.Header.OrgId);
                    updateDocParam.Add("@branchid", obj.Header.BranchId);
                    updateDocParam.Add("@user_id", obj.Header.userid);
                    updateDocParam.Add("@user_ip", obj.Header.CreatedIP);
                    updateDocParam.Add("@in_revenue", null);

                    await _connection.ExecuteAsync(
                        RevenueBackEnd.RevenueProcedure,
                        updateDocParam,
                        commandType: CommandType.StoredProcedure);
                }

                return new ResponseModel
                {
                    Data = result,
                    Message = "Revenue saved successfully",
                    Status = true
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Data = null,
                    Message = "Error saving revenue: " + ex.Message,
                    Status = false
                };
            }
        }

        public async Task<object> UpdateAsync(RevenueModel obj)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 2); // Update
                param.Add("@revenue_id", obj.Header.RevenueId);
                param.Add("@revenuetype", null);
                param.Add("voucher_no", null);
                param.Add("@orgid", obj.Header.OrgId);
                param.Add("@branchid", obj.Header.BranchId);
                param.Add("@user_id", obj.Header.userid);
                param.Add("@user_ip", obj.Header.ModifiedIP);
                param.Add("@in_revenue", JsonConvert.SerializeObject(new[] { obj.Header }));


                var result = await _connection.QueryFirstOrDefaultAsync<object>(
                    RevenueBackEnd.RevenueProcedure, param, commandType: CommandType.StoredProcedure);

                return new ResponseModel
                {
                    Data = result,
                    Message = "Revenue updated successfully",
                    Status = true
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Data = null,
                    Message = "Error updating Revenue: " + ex.Message,
                    Status = false
                };
            }
        }

        public async Task<object> GetByIdRevenueAsync(int revenueid, int branchid, int orgid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 3); // Get by ID
                param.Add("@revenue_id", revenueid);
                param.Add("@revenuetype", null);
                param.Add("voucher_no", null);
                param.Add("@orgid", orgid);
                param.Add("@branchid", branchid);
                param.Add("@user_id", 0);
                param.Add("@user_ip", "");
                param.Add("@in_revenue", null);


                var result = await _connection.QueryMultipleAsync(
                    RevenueBackEnd.RevenueProcedure, param, commandType: CommandType.StoredProcedure);

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
                    Message = "Error retrieving revenue: " + ex.Message,
                    Status = false
                };
            }
        }

        public async Task<object> GetListRevenueAsync(int revenueid, string revtype, string voucherno, int branchid, int orgid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 3); // List
                param.Add("@revenue_id", revenueid);
                param.Add("@revenuetype", revtype);
                param.Add("@voucher_no", voucherno);
                param.Add("@orgid", orgid);
                param.Add("@branchid", branchid);
                param.Add("@user_id", 0);
                param.Add("@user_ip", "");
                param.Add("@in_revenue", null);


                var result = await _connection.QueryAsync<object>(
                    RevenueBackEnd.RevenueProcedure, param, commandType: CommandType.StoredProcedure);

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
                    Message = "Error retrieving revenue list: " + ex.Message,
                    Status = false
                };
            }
        }

        public async Task<object> GetRevenueTypeListAsync(int branchid, int orgid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 5); // List
                param.Add("@revenue_id", 0);
                param.Add("@revenuetype", null);
                param.Add("voucher_no", null);
                param.Add("@orgid", orgid);
                param.Add("@branchid", branchid);
                param.Add("@user_id", 0);
                param.Add("@user_ip", "");
                param.Add("@in_revenue", null);


                var result = await _connection.QueryAsync<object>(
                    RevenueBackEnd.RevenueProcedure, param, commandType: CommandType.StoredProcedure);

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
                    Message = "Error retrieving Revenue Type list: " + ex.Message,
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
                param.Add("@revenue_id", 0);
                param.Add("@revenuetype", null);
                param.Add("voucher_no", null);
                param.Add("@orgid", orgid);
                param.Add("@branchid", branchId);
                param.Add("@user_id", userid);
                param.Add("@user_ip", "");
                param.Add("@in_revenue", null);

                var result = await _connection.QueryFirstOrDefaultAsync<object>(
                    RevenueBackEnd.RevenueProcedure,
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
