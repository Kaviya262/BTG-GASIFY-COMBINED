using System.Data;
using BackEnd.Units;
using Core.Abstractions;
using Core.Master.Units;
using Core.Models;
using Dapper;
using UserPanel.Infrastructure.Data;
using static Core.Master.Units.UnitsItem;

namespace Infrastructure.Repositories
{
    public class UnitsRepository : IUnitsRepository
    {
        private readonly IDbConnection _connection;
        public UnitsRepository(IUnitOfWorkDB1 unitOfWork)
        {
            _connection = unitOfWork.Connection;
        }

        #region GetAllUnitsAsync
        public async Task<object> GetAllUnitsAsync(int opt, int unitsId, string unitsCode)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("Opt", opt); //1
                param.Add("UnitId", unitsId); //0
                param.Add("UnitCode", unitsCode);

                var result = await _connection.QueryAsync<object>(Units.UnitsProcedure,
                    param: param, commandType: CommandType.StoredProcedure);
                var modelList = result.ToList();


                return new ResponseModel()
                {
                    Data = modelList,
                    Message = "Unit Items Listed!",
                    Status = true
                };


            }
            catch (Exception ex)
            {
                return new ResponseModel()
                {
                    Data = ex,
                    Message = "No Records Found!",
                    Status = false
                };
            }
        }
        #endregion
        #region GetUnitsByIdAsync
        public async Task<object> GetUnitsByIdAsync(int opt, int unitsId, string unitsCode)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("Opt", opt); //2
                param.Add("UnitId", unitsId);
                param.Add("UnitCode", unitsCode); //null
                var result = await _connection.QueryFirstOrDefaultAsync<object>(Units.UnitsProcedure,
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
                    Message = "No Records Found!",
                    Status = false
                };
            }
        }
        #endregion
        #region GetUnitsByCodeAsync
        public async Task<object> GetUnitsByCodeAsync(int opt, int unitsId, string unitsCode)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("Opt", opt); //3
                param.Add("UnitId", unitsId); //null
                param.Add("UnitCode", unitsCode);

                var result = await _connection.QueryAsync<object>(Units.UnitsProcedure,
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
                    Message = "No Records Found!",
                    Status = false
                };
            }
        }
        #endregion

        #region CreateUnitsAsync
        public async Task<object> CreateUnitsAsync(UnitsItemMain obj)
        {
            try
            {
                var insertquery = @"INSERT INTO master_uom(UOM,Description,
                             IsActive, CreatedBy,CreatedIP,CreatedDate,OrgId,BranchId)
                             VALUES(@UOMCode, @UOMDescription,
                              1,@UserId, '',Now(),@OrgId, @BranchId);
                             SELECT LAST_INSERT_ID();";
                var newid = await _connection.ExecuteScalarAsync<int>(insertquery, obj.Header);
                if (newid == 0)
                {
                    return new ResponseModel()
                    {
                        Data = null,
                        Message = "Give Unique UnitCode!",
                        Status = false
                    };

                }
                return new ResponseModel()
                {
                    Data = newid,
                    Message = "New Record inserted!" + newid,
                    Status = true
                };

            }
            catch (Exception ex)
            {
                return new ResponseModel()
                {
                    Data = ex,
                    Message = "Give Unique UnitCode!",
                    Status = false
                };
            }
        }
        #endregion


        #region UpdateUnitsAsync
        public async Task<object> UpdateUnitsAsync(UnitsItemMain obj)
        {
            try
            {
                var updatequery = @"UPDATE master_uom
                           SET UOM = @UOMCode,
                               Description = @UOMDescription,                                       
                               IsActive = @IsActive,
                               LastModifiedBy = @UserId,
                               LastModifiedIP='',
                               LastModifiedDate = Now()
                               WHERE Id = @UOMId;";

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
                    Data = ex,
                    Message = "No Records Found!",
                    Status = false
                };
            }
        }
        #endregion

    }
}
