using System.Data;
using System.Text.Json;
using BackEnd.AccessRights;
using BackEnd.Finance.ClaimAndPayment;
using Core.Abstractions;
using Core.AccessRights;
using Core.Finance.PeriodicPaymentPlan;
using Core.Models;
using Dapper;

namespace Infrastructure.Repositories
{
    public class PeriodicPayemntPlanRepository : IPeriodicPayemntPlanRepository
    {

        private readonly IDbConnection _connection;

        public PeriodicPayemntPlanRepository(IUnitOfWorkDB3 financedb)
        {
            _connection = financedb.Connection;
        }

        //public async Task<object> ApproveAsync(ClaimApprovalHdr obj)
        //{
        //    try
        //    {


        //        const string updatedetails = @"update tbl_claimAndpayment_header set claim_gm_isapproved=@isapprovedone, claim_gm_isdiscussed=@isdiscussedone, claim_director_isapproved=@isapprovedtwo, claim_director_isdiscussed=@isdiscussedtwo, claim_comment=@remarks where Claim_ID=@claimid";

        //        await _connection.ExecuteAsync(updatedetails, obj.approve);


        //        return new ResponseModel
        //        {
        //            Data = 1,
        //            Message = "updated Successfully",
        //            Status = true
        //        };
        //    }
        //    catch (Exception Ex)
        //    {
        //        return new ResponseModel
        //        {
        //            Data = null,
        //            Message = "Something went wrong while updating . : " + Ex.Message,
        //            Status = false
        //        };
        //    }
        //}

        //public async Task<object> GetHistoryAsync(int id, int userid, int branchId, Int32 orgid, string fromdate, string todate)
        //{
        //    try
        //    {
        //        var param = new DynamicParameters();

        //        param.Add("@opt", 2);
        //        param.Add("@userid", userid);
        //        param.Add("@branchid", branchId);
        //        param.Add("@orgid", orgid);
        //        param.Add("@id", id);
        //        param.Add("@fromdate", fromdate);
        //        param.Add("@todate", todate);




        //        var list = await _connection.QueryAsync(ClaimAndPaymentDB.ClaimAndPaymentApproval, param, commandType: CommandType.StoredProcedure);

        //        return new ResponseModel
        //        {
        //            Data = list,
        //            Message = "Success",
        //            Status = true
        //        };
        //    }
        //    catch (Exception)
        //    {
        //        return new ResponseModel
        //        {
        //            Data = null,
        //            Message = "Error retrieving claim and payment by ID.",
        //            Status = false
        //        };
        //    }
        //}

        //public async Task<object> GetAllAsync(int Id, int branchId, Int32 orgid, int userid)
        //{
        //    try
        //    {
        //        var param = new DynamicParameters();
        //        param.Add("@opt", 1);
        //        param.Add("@userid", userid);
        //        param.Add("@branchid", branchId);
        //        param.Add("@orgid", orgid);
        //        param.Add("@id", 0);
        //        param.Add("@fromdate", "");
        //        param.Add("@todate", "");
        //        var list = await _connection.QueryAsync(ClaimAndPaymentDB.ClaimAndPaymentApproval, param, commandType: CommandType.StoredProcedure);

        //        return new ResponseModel
        //        {
        //            Data = list,
        //            Message = "Success",
        //            Status = true
        //        };
        //    }
        //    catch (Exception)
        //    {
        //        return new ResponseModel
        //        {
        //            Data = null,
        //            Message = "Error retrieving claims.",
        //            Status = false
        //        };
        //    }
        //}

        public async Task<object> GetAllPeriodicPaymentPlanAsync(int Id, int branchId, Int32 orgid, int userid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 1);
                param.Add("@userid", userid);
                param.Add("@branchid", branchId);
                param.Add("@orgid", orgid);
                param.Add("@id", 0);
                param.Add("@fromdate", "");
                param.Add("@todate", "");
                var list = await _connection.QueryAsync(ClaimAndPaymentDB.PeriodicPaymentPlan, param, commandType: CommandType.StoredProcedure);

                return new ResponseModel
                {
                    Data = list,
                    Message = "Success",
                    Status = true
                };
            }
            catch (Exception)
            {
                return new ResponseModel
                {
                    Data = null,
                    Message = "Error retrieving claims.",
                    Status = false
                };
            }
        }
        public async Task<object> SavePeriodicPaymentPlanAsync(PeriodicPaymentPlanHdr obj)
        {
            try
            {
                var approveJson = JsonSerializer.Serialize(obj.approve);

                foreach (var row in obj.approve)
                {
                    var param = new DynamicParameters();
                    param.Add("@p_Claim_ID", row.claimid);
                    param.Add("@p_ModeOfPaymentId", row.ModeOfPaymentId);
                    param.Add("@p_BankId", row.BankId);
                    param.Add("@p_PaymentDate", row.PaymentDate);
                    param.Add("@p_IsVoucherGenerate", true);
                    param.Add("@p_UserId", obj.UserId);
                    param.Add("@p_BranchId", obj.branchid);

                    var list = await _connection.QueryAsync(ClaimAndPaymentDB.UpdateClaimPaymentInfo, param, commandType: CommandType.StoredProcedure);
                }

                var paramd = new DynamicParameters();
                paramd.Add("p_userid", obj.UserId, DbType.Int32);
                paramd.Add("p_orgid", obj.orgid, DbType.Int32);
                paramd.Add("p_branchid", obj.branchid, DbType.Int32);
                paramd.Add("p_approve", approveJson, DbType.String);
                await _connection.ExecuteAsync(
           "proc_generatevoucher",
           paramd,
           commandType: CommandType.StoredProcedure);

                return new ResponseModel
                {
                    Data = 1,
                    Message = "Updated successfully",
                    Status = true
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Data = null,
                    Message = "Something went wrong while updating: " + ex.Message,
                    Status = false
                };
            }
        }


        public async Task<object> GetVoucher(int voucherid, int branchId, int orgid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 1);
                param.Add("@voucherid", voucherid);
                param.Add("@branchid", branchId);
                param.Add("@orgid", orgid);
                param.Add("@p_approve", "");
                
                var result = await _connection.QueryMultipleAsync(
                    ClaimAndPaymentDB.PaymentVoucher,
                    param,
                    commandType: CommandType.StoredProcedure
                );

                // Read all 3 result sets
                var header = result.Read<VoucherHeader>().FirstOrDefault();
                var details = result.Read<VoucherDetail>().ToList();
                var signatures = result.Read<SignatureLabel>().ToList();

                return new ResponseModel
                {
                    Data = new
                    {
                        Header = header,
                        Details = details,
                        Signatures = signatures
                    },
                    Message = "Success",
                    Status = true
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Data = null,
                    Message = $"Error retrieving voucher details: {ex.Message}",
                    Status = false
                };
            }
        }


    }
}
