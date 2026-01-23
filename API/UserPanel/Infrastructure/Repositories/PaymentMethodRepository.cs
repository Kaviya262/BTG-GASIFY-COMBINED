using System.Data;
using BackEnd.PaymentMethod;
using Core.Abstractions;
using Core.Master.PaymentMethod;
using Core.Models;
using Dapper;
using UserPanel.Infrastructure.Data;
using static Core.Master.PaymentMethod.PaymentMethodItem;

namespace Infrastructure.Repositories
{
    public class PaymentMethodRepository : IPaymentMethodRepository
    {
        private readonly IDbConnection _connection;
        public PaymentMethodRepository(IUnitOfWorkDB1 unitOfWork)
        {
            _connection = unitOfWork.Connection;
        }

        #region GetAllPaymentMethodAsync
        public async Task<object> GetAllPaymentMethodAsync(int opt, int payMid, string paymethodCode)



        {
            try
            {
                var param = new DynamicParameters();
                param.Add("Opt", opt); //1
                param.Add("PayMId", payMid); //null
                param.Add("PayMCode", paymethodCode);

                var data = await _connection.QueryAsync<object>(PaymentMethod.PaymentMethodProcedure,
                    param: param, commandType: CommandType.StoredProcedure);
                var modelList = data.ToList();

                return new ResponseModel()
                {
                    Data = modelList,
                    Message = "Payment Methods Listed!",
                    Status = true
                };

            }
            catch (Exception ex)
            {
                return new ResponseModel()
                {
                    Data = null,
                    Message = "No Records Found!",
                    Status = false
                };
            }
        }
        #endregion

        #region GetPaymentMethodByIdAsync
        public async Task<object> GetPaymentMethodByIdAsync(int opt, int Id, string payMcode)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("Opt", opt); //2
                param.Add("PayMId", Id);
                param.Add("PayMCode", payMcode); // empty

                var data = await _connection.QueryFirstOrDefaultAsync<object>(PaymentMethod.PaymentMethodProcedure,
                    param: param, commandType: CommandType.StoredProcedure);

                if (data == null)
                {
                    return new ResponseModel()
                    {
                        Data = null,
                        Message = "No Id Matching Record!",
                        Status = false
                    };
                }

                return new ResponseModel()
                {
                    Data = data,
                    Message = "Id Matching Record!",
                    Status = true
                };

            }
            catch (Exception ex)
            {
                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went wrong : " + ex.Message,
                    Status = false
                };
            }
        }
        #endregion

        #region GetPaymentMethodByCodeAsync
        public async Task<object> GetPaymentMethodByCodeAsync(int opt, int payMId, string PMCode)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("Opt", opt); //3
                param.Add("PayMId", payMId); //null
                param.Add("PayMCode", PMCode); //get by code

                var data = await _connection.QueryAsync<object>(PaymentMethod.PaymentMethodProcedure,
                    param: param, commandType: CommandType.StoredProcedure);
                if (data == null)
                {
                    return new ResponseModel()
                    {
                        Data = null,
                        Message = "No Code Matching Record!",
                        Status = false
                    };
                }

                return new ResponseModel()
                {
                    Data = data,
                    Message = "Code Matching Record!",
                    Status = true
                };

            }
            catch (Exception ex)
            {
                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went wrong : " + ex.Message,
                    Status = false
                };
            }
        }
        #endregion

        #region CreatePaymentMethodAsync
        public async Task<object> CreatePaymentMethodAsync(PaymentMethodItemMain obj)
        {
            try
            {
                var insertquery = @"
                            INSERT INTO master_paymentmethod (
                                PaymentMethod, PaymentMethodName, PaymentId, IsActive, 
                                CreatedBy, CreatedIP, CreatedDate, OrgId, BranchId
                            ) VALUES (
                                @PaymentMethodCode, @PaymentMethodName, 1, @IsActive,
                                @UserId, '', NOW(), 1, 1
                            );
                            SELECT LAST_INSERT_ID();
                            ";

                var data = await _connection.ExecuteScalarAsync<int>(insertquery, obj.Header);
                if (data > 0)
                {
                    return new ResponseModel()
                    {
                        Data = data,
                        Message = "Paymentmethod is inserted sucessfully",
                        Status = true
                    };
                }
                return new ResponseModel()
                {
                    Data = null,
                    Message = "Not Created!",
                    Status = false
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went Wrong!" + ex.Message,
                    Status = false
                };
            }
        }
        #endregion


        #region UpdatePaymentMethodAsync
        public async Task<object> UpdatePaymentMethodAsync(PaymentMethodItemMain obj)
        {
            try
            {
                var updatequery = @"
            UPDATE master_paymentmethod
            SET
                PaymentMethod = @PaymentMethodCode,
                PaymentMethodName = @PaymentMethodName,
                IsActive = @IsActive,
                LastModifiedBy = @UserId,
                LastModifiedIP = '',
                LastModifiedDate = NOW()
            WHERE Id = @PaymentMethodId AND PaymentId = 1;
        ";

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
                    Message = "Something went Wrong!" + ex.Message,
                    Status = false
                };

            }
        }

        public Task<object> UpdateStatus(PaymentMethodItemMain paymentM)
        {
            throw new NotImplementedException();
        }
        #endregion

    }

}

