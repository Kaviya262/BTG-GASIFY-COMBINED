using System.Data;
using BackEnd.Master;
using Core.Abstractions;
using Core.Models;
using Core.OrderMngMaster.Users;
using Dapper;
using DocumentFormat.OpenXml.Spreadsheet;
using UserPanel.Infrastructure.Data;

namespace Infrastructure.Repositories
{
    public class MasterUsersRepository : IMasterUsersRepository
    {
        private readonly IDbConnection _connection;

        public MasterUsersRepository(IUnitOfWorkDB1 unitOfWork)
        {
            _connection = unitOfWork.Connection;
        }

        public Task<object> GetAllAsync(int opt)
        {
            throw new NotImplementedException();
        }

        #region Get All Users
        public async Task<object> GetAllUser(int? prodId, string fromDate, string toDate, int? branchId, string UserName, string keyword, int? pageNumber, int? pageSize)
        {
            try
            {
                var param = new DynamicParameters();

                param.Add("@searchUsername", string.IsNullOrEmpty(UserName) ? null : UserName, DbType.String);
                param.Add("@fromDate", string.IsNullOrEmpty(fromDate) ? (object)DBNull.Value : DateTime.Parse(fromDate).ToString("yyyy-MM-dd"), DbType.String);
                param.Add("@toDate", string.IsNullOrEmpty(toDate) ? (object)DBNull.Value : DateTime.Parse(toDate).ToString("yyyy-MM-dd"), DbType.String);
                param.Add("@keyword", string.IsNullOrEmpty(keyword) ? null : keyword, DbType.String);
                param.Add("@branchId", branchId, DbType.Int32);
                param.Add("@pageNumber", pageNumber, DbType.Int32);
                param.Add("@pageSize", pageSize, DbType.Int32);

                var list = await _connection.QueryAsync(MasterUsersMaster.GetAllMasterUserProcedure, param: param, commandType: CommandType.StoredProcedure);
                var modelList = list.ToList();

                return new ResponseModel()
                {
                    Data = modelList,
                    Message = "Success",
                    Status = true
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel()
                {
                    Data = null,
                    Message = $"Something went wrong: {ex.Message}",
                    Status = false
                };
            }
        }

        #endregion

        #region Toggle User Active Status
        public async Task<object> ToggleUserActiveStatusAsync(MasterUsersCommand userStatus)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@in_Id", userStatus.MasterUser.Id);
                param.Add("@in_IsActive", userStatus.MasterUser.IsActive);
                param.Add("@in_Remarks", userStatus.MasterUser.Remark); 
                param.Add("@in_BranchId", userStatus.MasterUser.BranchId); 

                var responseCode = await _connection.QueryFirstOrDefaultAsync<int>(
                    MasterUsersMaster.UpdateUserStatus,
                    param,
                    commandType: CommandType.StoredProcedure
                );

                return new ResponseModel()
                {
                    Data = null,
                    Message = responseCode == 0 ? "User Active Status Toggled Successfully" : "Failed to Toggle Active Status",
                    Status = responseCode == 0
                };

            }
            catch (Exception ex)
            {
                return new ResponseModel()
                {
                    Data = null,
                    Message = $"Error: {ex.Message}",
                    Status = false
                };
            }
        }
        #endregion



        public async  Task<object> UpdateUserPasswordAsync(MasterUsersCommandpwd createOrUpdateUser)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("opt",1);

                param.Add("u_userid", createOrUpdateUser.MasterUserspwd.Id);
                param.Add("u_password", createOrUpdateUser.MasterUserspwd.Password);
                param.Add("u_old_password", createOrUpdateUser.MasterUserspwd.oldpassword);
                var result = await _connection.QueryAsync<int>(
                    "proc_updateusercredential",
                    param,
                    commandType: CommandType.StoredProcedure
                );
                var user = result.FirstOrDefault();
                if (user == 1)
                {
                    return new ResponseModel
                    {
                        Data = null,
                        Message = "Password updated",
                        Status = true,
                        StatusCode = 200
                    };
                }
                else
                { 
                        return new ResponseModel
                        {
                            Data = null,
                            Message = "Old password not matched",
                            Status = false,
                            StatusCode = 400
                        };
                    
                }

            }
            catch(Exception ex)
            {
                return new ResponseModel
                {
                    Data = null,
                    Message = "User not found",
                    Status = false,
                    StatusCode=500
                };
            }

           

        }

        #region Create or Update User
        public async Task<object> CreateOrUpdateUserAsync(MasterUsersCommand createOrUpdateUser)
        {
            try
            {
                var param = new DynamicParameters();

                // Input parameters
                param.Add("in_Id", createOrUpdateUser.MasterUser.Id == 0 ? 0 : createOrUpdateUser.MasterUser.Id, DbType.Int32);
                param.Add("in_FirstName", createOrUpdateUser.MasterUser.FirstName);
                param.Add("in_MiddleName", createOrUpdateUser.MasterUser.MiddleName);
                param.Add("in_LastName", createOrUpdateUser.MasterUser.LastName);
                param.Add("in_UserName", createOrUpdateUser.MasterUser.UserName);
                param.Add("in_Password", createOrUpdateUser.MasterUser.Password);
                param.Add("in_Role", createOrUpdateUser.MasterUser.Role);
                param.Add("in_Department", createOrUpdateUser.MasterUser.Department);
                param.Add("in_MobileNo", createOrUpdateUser.MasterUser.MobileNo);
                param.Add("in_EmailID", createOrUpdateUser.MasterUser.EmailID);
                param.Add("in_FromDate", createOrUpdateUser.MasterUser.FromDate);
                param.Add("in_ToDate", createOrUpdateUser.MasterUser.ToDate);
                param.Add("in_Remarks", createOrUpdateUser.MasterUser.Remark);
                param.Add("in_BranchId", createOrUpdateUser.MasterUser.BranchId);
                param.Add("in_CreatedBy", createOrUpdateUser.MasterUser.CreatedBy);

                // Output parameters
                param.Add("out_NewUserId", dbType: DbType.Int32, direction: ParameterDirection.Output);
                param.Add("out_ResponseCode", dbType: DbType.Int32, direction: ParameterDirection.Output);
                param.Add("out_Message", dbType: DbType.String, size: 255, direction: ParameterDirection.Output);

                // Execute stored procedure
                await _connection.ExecuteAsync(
                    MasterUsersMaster.CreateOrUpdateUser,
                    param,
                    commandType: CommandType.StoredProcedure
                );

                // Get output values
                int newUserId = param.Get<int?>("out_NewUserId") ?? 0;
                int result = param.Get<int>("out_ResponseCode");
                string messageFromDb = param.Get<string>("out_Message");

                string message;
                bool status;
                int statusCode;
                int data;

                switch (result)
                {
                    case 0:
                        data = newUserId;
                        message = "User Updated Successfully";
                        status = true;
                        statusCode = 200;
                        break;
                    case 1:
                        data = newUserId;
                        message = "User Created Successfully";
                        status = true;
                        statusCode = 200;
                        break;
                    case 2:
                        data = newUserId;
                        message = "Username already exists";
                        status = false;
                        statusCode = 400;
                        break;
                    case 3:
                        data = newUserId;
                        message = "Email already exists";
                        status = false;
                        statusCode = 400;
                        break;
                    case 4:
                        data = newUserId;
                        message = "User not found for update";
                        status = false;
                        statusCode = 404;
                        break;
                    default:
                        data = newUserId;
                        message = "Failed to Create/Update User";
                        status = false;
                        statusCode = 500;
                        break;
                }

                return new ResponseModel()
                {
                    Data = data,
                    Message = messageFromDb ?? message,
                    Status = status,
                    StatusCode = statusCode
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel()
                {
                    Data = null,
                    Message = $"Error: {ex.Message}",
                    Status = false,
                    StatusCode = 500
                };
            }
        }
        #endregion


        #region Get User by ID and Branch ID
        public async Task<object> GetUserByIdAsync(int userId,int branchId)
        {
            var param = new DynamicParameters();
            param.Add("in_UserID", userId);
            param.Add("in_BranchId", branchId);

            var result = await _connection.QueryAsync<MasterUsers>(
                "GetUserById",
                param,
                commandType: CommandType.StoredProcedure
            );

            var user = result.FirstOrDefault();

            if (user == null)
            {
                return new ResponseModel
                {
                    Data = null,
                    Message = "User not found",
                    Status = false
                };
            }

            var command = new MasterUsersCommand
            {
                MasterUser = user
            };

            return new ResponseModel
            {
                Data = command,
                Message = "User found",
                Status = true
            };
        }

        #endregion
    }
}
