using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BackEnd.PaymentTerms;
using Core.Abstractions;
using Core.Master.PaymentTerms;
using Core.Models;
using Dapper;
using MySqlX.XDevAPI.Common;
using UserPanel.Infrastructure.Data;
using static Core.Master.PaymentTerms.PaymentTermItem;

namespace Infrastructure.Repositories
{
    public class PaymentTermRepository : IPaymentTermRepository
    {
        private readonly IDbConnection _connection;
        public PaymentTermRepository(IUnitOfWorkDB1 unitOfWork)
        {
            _connection = unitOfWork.Connection ;
        }
        #region GetAllPaymentTermAsync
        public async Task<object> GetAllPaymentTermAsync(int opt, int payTermId, string payTermCode)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("Opt", opt); //1
                param.Add("PayTmId", payTermId); //null
                param.Add("PayTmCode", payTermCode);

                var result = await _connection.QueryAsync<object>(PaymentTerms.PaymentTermProcedure,
                    param: param, commandType: CommandType.StoredProcedure);
                var modelList = result.ToList();


                return new ResponseModel()
                {
                    Data = modelList,
                    Message = "Payment Terms Listed!",
                    Status = true
                };


            }
            catch (Exception ex)
            {
                return new ResponseModel()
                {
                    Data = null,
                    Message = "No Records Found!" + ex.Message,
                    Status = false
                };
            }
        }
        #endregion

        #region GetPaymentTermByIdAsync
        public async Task<object> GetPaymentTermByIdAsync(int opt, int payTermId, string payTermCode)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("Opt", opt); //2
                param.Add("PayTmId", payTermId);
                param.Add("PayTmCode", payTermCode); //null
                var result = await _connection.QueryFirstOrDefaultAsync<object>(PaymentTerms.PaymentTermProcedure,
                    param: param, commandType: CommandType.StoredProcedure);

                if (result == null)
                {
                    return new ResponseModel()
                    {
                        Data = null,
                        Message = "No Match Found!",
                        Status = false
                    };
                }
                return new ResponseModel()
                {
                    Data = result,
                    Message = "Id Match Found!",
                    Status = true
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel()
                {
                    Data = null,
                    Message = "No Records Found!" + ex.Message,
                    Status = false
                };
            }
        }
        #endregion

        #region GetPaymentTermByCodeAsync
        public async Task<object> GetPaymentTermByCodeAsync(int opt, int payTermId, string payTermCode)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("Opt", opt); //3
                param.Add("PayTmId", payTermId); //null
                param.Add("PayTmCode", payTermCode);

                var result = await _connection.QueryAsync<object>(PaymentTerms.PaymentTermProcedure,
                    param: param, commandType: CommandType.StoredProcedure);

                if (result == null)
                {
                    return new ResponseModel()
                    {
                        Data = null,
                        Message = "No Records Found!",
                        Status = false
                    };
                }

                return new ResponseModel()
                {
                    Data = result,
                    Message = "Records Found!",
                    Status = true
                };

            }
            catch (Exception ex)
            {
                return new ResponseModel()
                {
                    Data = null,
                    Message = "No Records Found!" + ex.Message,
                    Status = false
                };
            }
        }
        #endregion

        #region CreatePaymentTermAsync
        public async Task<object> CreatePaymentTermAsync(PaymentTermMain obj)
        {
            try
            {
                var insertquery = @"INSERT INTO master_terms(TermName,Description,DueDays,
                                    IsActive, CreatedBy,CreatedIP,CreatedDate)
                                    VALUES(@PaymentTermCode, @PaymentTermDesc, @DueDays,
                                     1,@UserId, '',Now());
                                    SELECT LAST_INSERT_ID();";
                var newid = await _connection.ExecuteScalarAsync<int>(insertquery, obj.Header);
                if (newid == 0)
                {
                    return new ResponseModel()
                    {
                        Data = null,
                        Message = "No Records Found!",
                        Status = false
                    };

                }
                return new ResponseModel()
                {
                    Data = newid,
                    //Message = "New Record Id inserted : " + newid,
                    Message = "Payment Terms Inserted Successfully",
                    Status = true
                };

            }
            catch (Exception ex)
            {
                return new ResponseModel()
                {
                    Data = null,
                    Message = "No Records Found!" + ex.Message,
                    Status = false
                };
            }
        }
        #endregion

        #region UpdatePaymentTermAsync
        #region UpdatePaymentTermAsync
        public async Task<object> UpdatePaymentTermAsync(PaymentTermMain obj)
        {
            try
            {
                var updatequery = @"UPDATE master_terms
                           SET TermName = @PaymentTermCode,
                               Description = @PaymentTermDesc,
                               DueDays = @DueDays,
                               IsActive = @IsActive,
                               LastModifiedBy = @UserId,
                               LastModifiedIP = '',
                               LastModifiedDate = CURRENT_TIMESTAMP
                           WHERE Id = @PaymentTermId";

                var rowsAffected = await _connection.ExecuteAsync(updatequery, obj.Header);

                if (rowsAffected > 0)
                {
                    return new ResponseModel()
                    {
                        Data = rowsAffected,
                        Message = "Updated Successfully!!",
                        Status = true
                    };
                }
                else
                {
                    return new ResponseModel()
                    {
                        Data = null,
                        Message = "Update Failed!",
                        Status = false
                    };
                }
            }
            catch (Exception ex)
            {
                return new ResponseModel()
                {
                    Data = null,
                    Message = $"Update failed: {ex.Message}",
                    Status = false
                };
            }
        }

        public Task<object> UpdateStatus(PaymentTermMain command)
        {
            throw new NotImplementedException();
        }
        #endregion

        #endregion

    }
}

