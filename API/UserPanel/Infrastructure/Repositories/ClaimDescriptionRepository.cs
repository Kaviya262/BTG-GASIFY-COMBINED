using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using BackEnd.Master;
using Core.Abstractions;
using Core.Master.Claim;
using Core.Master.Item;
using Core.Models;
using Core.Procurement.InvoiceReceipt;
using Dapper;
using DocumentFormat.OpenXml.Spreadsheet;

namespace Infrastructure.Repositories
{
    public class ClaimDescriptionRepository : IClaimDescriptionRepository
    {
        private readonly IDbConnection _connection;

        public ClaimDescriptionRepository(IUnitOfWorkDB3 unitOfWork)
        {
            _connection = unitOfWork.Connection;
        }
        public async Task<object> GetAllCategory(int branchid, int orgid)
        {
            try
            {
                var parameters = new DynamicParameters();
                parameters.Add("opt", 1);
                parameters.Add("branchid", branchid);
                parameters.Add("orgid", orgid);
                parameters.Add("typeid", 0);
                parameters.Add("claimtypeid", 0);

                var result = await _connection.QueryAsync<dynamic>(ClaimDescriptionMaster.MasterClaimDescriptionProcedure, parameters, commandType: CommandType.StoredProcedure);

                return new ResponseModel
                {
                    Status = true,
                    Data = result
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Status = false,
                    Message = $"Error: {ex.Message}"
                };
            }
        }
        public async Task<object> GetAllCategorytypes(int branchid, int orgid, int typeid)
        {
            try
            {
                var parameters = new DynamicParameters();
                parameters.Add("opt", 2);
                parameters.Add("branchid", branchid);
                parameters.Add("orgid", orgid);
                parameters.Add("typeid", typeid);
                parameters.Add("claimtypeid", 0);

                var result = await _connection.QueryAsync<dynamic>(ClaimDescriptionMaster.MasterClaimDescriptionProcedure, parameters, commandType: CommandType.StoredProcedure);

                return new ResponseModel
                {
                    Status = true,
                    Data = result
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Status = false,
                    Message = $"Error: {ex.Message}"
                };
            }
        }
        public async Task<object> AddAsync(ClaimDescriptionPayment Obj)
        {
            try
            {
                string Message = "";
                const string headerSql = @"
                      INSERT INTO master_claim_payment_desc
                        (PaymentCode,PaymentDescription,claimtypeid,CreatedBy,CreatedDate,CreatedIP,LastModifiedBy,LastModifiedDate,LastModifiedIP,IsActive,OrgId,BranchId)
                        VALUES
                        (@paymentCode,@paymentdescription,@claimtypeid,@createdby,NOW(),@CreatedIP,0,NOW(),'',1,@OrgId,@BranchId);
                ";

                await _connection.ExecuteAsync(headerSql, Obj.payment);
                return new ResponseModel()
                {
                    Message = "Saved Successfully" + Message,
                    Status = true
                };
            }
            catch (Exception Ex)
            {
                return new ResponseModel()
                {
                    Message = $"Error: {Ex.Message}",
                    Status = false
                };
            }
        }
        public async Task<object> UpdateAsync(ClaimDescriptionPayment Obj)
        {
            try
            {
                const string headerSql = @"
                        UPDATE master_claim_payment_desc
                        SET
                        PaymentCode = @paymentCode,
                        PaymentDescription = @paymentdescription,
                        claimtypeid = @claimtypeid,
                        LastModifiedBy = @createdby,
                        LastModifiedDate = NOW(),
                        LastModifiedIP = '',
                        IsActive = 1,
                        OrgId = @OrgId,
                        BranchId = @BranchId
                        WHERE Id = @paymentid";

                await _connection.ExecuteAsync(headerSql, Obj.payment);

                return new ResponseModel
                {
                    Data = null,
                    Message = "Claim Description master updated successfully",
                    Status = true
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Data = null,
                    Message = "Something went wrong: " + ex.Message,
                    Status = false
                };
            }
        }
        public async Task<object> GetClaimDescriptionByIdAsync(int opt, int typeid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("Opt", opt); //2
                param.Add("branchid", 1);
                param.Add("orgid", 1);
                param.Add("typeid", typeid);
                param.Add("claimtypeid", 0);

                var result = await _connection.QueryAsync<dynamic>(ClaimDescriptionMaster.MasterClaimDescriptionProcedure, param, commandType: CommandType.StoredProcedure);

                if (result == null)
                {
                    return new ResponseModel()
                    {
                        Data = null,
                        Message = "Department Id not found!",
                        Status = false
                    };
                }

                return new ResponseModel()
                {
                    Data = result,
                    Message = "Department found!",
                    Status = true
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went wrong:" + ex.Message,
                    Status = false
                };
            }
        }
        public async Task<object> GetPaymentDescriptionList(int branchid, int orgid)
        {
            try
            {
                var parameters = new DynamicParameters();
                parameters.Add("opt", 4);
                parameters.Add("branchid", branchid);
                parameters.Add("orgid", orgid);
                parameters.Add("typeid", 0);
                parameters.Add("claimtypeid", 0);

                var result = await _connection.QueryAsync<dynamic>(ClaimDescriptionMaster.MasterClaimDescriptionProcedure, parameters, commandType: CommandType.StoredProcedure);

                return new ResponseModel
                {
                    Status = true,
                    Data = result
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Status = false,
                    Message = $"Error: {ex.Message}"
                };
            }
        }
        public async Task<object> DescriptionstatusChange(int paymentid)
        {
            try
            {
                const string updateDetailsSql = @"UPDATE master_claim_payment_desc SET isActive = CASE WHEN isActive = 1 THEN 0 ELSE 1 END WHERE id = @paymentid;";
                await _connection.ExecuteAsync(updateDetailsSql, new { paymentid });

                return new ResponseModel() { Data = null, Message = "Claim Payment Updated successfully", Status = true };
            }
            catch (Exception Ex)
            {
                return new ResponseModel() { Data = null, Message = "Something went wrong", Status = false };
            }
        }
        public async Task<object> searchbyCategory(int branchid, int orgid, int categoryid, int claimtypeid)
        {
            try
            {
                var parameters = new DynamicParameters();
                parameters.Add("opt", 5);
                parameters.Add("branchid", branchid);
                parameters.Add("orgid", orgid);
                parameters.Add("typeid", categoryid);
                parameters.Add("claimtypeid", claimtypeid);

                var result = await _connection.QueryAsync<dynamic>(ClaimDescriptionMaster.MasterClaimDescriptionProcedure, parameters, commandType: CommandType.StoredProcedure);

                return new ResponseModel
                {
                    Status = true,
                    Data = result
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Status = false,
                    Message = $"Error: {ex.Message}"
                };
            }
        }
    }
}
