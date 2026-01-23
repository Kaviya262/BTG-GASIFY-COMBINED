using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BackEnd.Department;
using Core.Master.Department;
using Core.Models;
using Dapper;
using UserPanel.Infrastructure.Data;
using static Core.Master.Department.DepartmentItem;
using System.Web;
using Core.Abstractions;

namespace Infrastructure.Repositories
{
    public class DepartmentRepository : IDepartmentRepository
    {
        private readonly IDbConnection _connection;

        public DepartmentRepository(IUnitOfWorkDB1 unitOfWork)
        {
            _connection = unitOfWork.Connection;
        }
        #region GetAllDepartmentAsync
        public async Task<object> GetAllDepartmentAsync(int opt, int DepartId, string DepartCode, string DepartName)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("Opt", opt); //1
                param.Add("DeptId", DepartId);
                param.Add("DeptCode", string.IsNullOrEmpty(DepartCode) ? null : DepartCode);
                param.Add("DeptName", string.IsNullOrEmpty(DepartName) ? null : DepartName);

                var List = await _connection.QueryAsync<object>(Department.DepartmentProcedure,
                    param: param, commandType: CommandType.StoredProcedure);
                var modelList = List.ToList();

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
                    Message = ex.Message,
                    Status = false
                };
            }
        }
        #endregion
        #region GetDepartmentByIdAsync
        public async Task<object> GetDepartmentByIdAsync(int opt, int departmentId, string dpCode, string dpName)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("Opt", opt); //2
                param.Add("DeptId", departmentId);
                param.Add("DeptCode", dpCode);
                param.Add("DeptName", dpName);

                var data = await _connection.QueryFirstOrDefaultAsync<object>(Department.DepartmentProcedure,
                    param: param, commandType: CommandType.StoredProcedure);

                if (data == null)
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
                    Data = data,
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
        #endregion
        #region GetDepartmentByCodeAsync
        public async Task<object> GetDepartmentByCodeAsync(int opt, int dpId, string departCode, string dpName)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("Opt", opt); //3
                param.Add("DeptId", dpId);
                param.Add("DeptCode", departCode);
                param.Add("DeptName", dpName);

                var data = await _connection.QueryAsync<object>(Department.DepartmentProcedure,
                    param: param, commandType: CommandType.StoredProcedure);

                if (data == null)
                {
                    return new ResponseModel()
                    {
                        Data = null,
                        Message = "User Role not found!",
                        Status = false
                    };
                }

                return new ResponseModel()
                {
                    Data = data,
                    Message = "User Role found!",
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
        #endregion
        #region GetDepartmentByNameAsync
        public async Task<object> GetDepartmentByNameAsync(int opt, int dpId, string dpCode, string departName)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("Opt", opt); //4
                param.Add("DeptId", dpId);
                param.Add("DeptCode", dpCode);
                param.Add("DeptName", departName);

                var data = await _connection.QueryAsync<object>(Department.DepartmentProcedure,
                    param: param, commandType: CommandType.StoredProcedure);

                if (data == null)
                {
                    return new ResponseModel()
                    {
                        Data = null,
                        Message = "Department Name not found!",
                        Status = false
                    };
                }

                return new ResponseModel()
                {
                    Data = data,
                    Message = "Department Name found!",
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
        #endregion
        #region CreateDepartmentAsync
        public async Task<object> CreateDepartmentAsync(DepartmentItemMain obj)
        {
            try
            {
                var query = @"INSERT INTO master_department (
                   DepartmentCode, DepartmentName, DepartmentRemark, 
                   CreatedBy, CreatedDate, CreatedIP,                                   
                   IsActive, OrgId, BranchId)     
                  VALUES (
                   @DepartmentCode, @DepartmentName, @DepartmentRemark, 
                   @UserId, Now(), '',1, @OrgId, @BranchId
                    );
                    SELECT LAST_INSERT_ID();";
                var result = await _connection.ExecuteScalarAsync<int>(query, obj.Header);

                if (result > 0)
                    return new ResponseModel()
                    {
                        Data = result,
                        Message = "Department created successfully",
                        Status = true
                    };
                else
                    return new ResponseModel()
                    {
                        Data = null,
                        Message = "Failed to Create Department",
                        Status = false
                    };

            }
            catch (Exception ex)
            {
                return new ResponseModel()
                {
                    Data = null,
                    Message = ex.Message,
                    Status = false
                };
            }
        }
        #endregion
        #region UpdateDepartmentAsync
        public async Task<object> UpdateDepartmentAsync(DepartmentItemMain obj)
        {
            try
            {
                var Updatequery = @"
                    UPDATE master_department
                    SET 
                        DepartmentCode = @DepartmentCode,
                        DepartmentName = @DepartmentName,
                        DepartmentRemark = @DepartmentRemark,                      
                        ModifiedBy = @UserId,
                        ModifiedDate = Now(),  
                        ModifiedIP = '',
                        IsActive = @IsActive                                              
                        WHERE DepartmentId = @DepartmentId;";
                var rowsAffected = await _connection.ExecuteAsync(Updatequery, obj.Header);

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
                    Message = ex.Message,
                    Status = false
                };
            }
        }
        #endregion


    }
}
