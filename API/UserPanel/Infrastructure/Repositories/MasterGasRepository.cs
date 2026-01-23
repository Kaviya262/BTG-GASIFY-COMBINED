using BackEnd.Master;
using Core.Abstractions;
using Core.Master.Gas;
using Core.Models;
using Dapper;
using System.Data;
using UserPanel.Infrastructure.Data;

namespace Infrastructure.Repositories.Master
{
    public class MasterGasRepository : IMasterGasRepository
    {
        static class SQLQuery
        {
            public const string GetLastInsertedIdSql = "SELECT LAST_INSERT_ID();";

            public const string insertMasterGas =
                "INSERT INTO master_gascode(GasCode, GasName, Volume, Pressure, CreatedBy, CreatedDate, CreatedIP, " +
                "IsActive, OrgId, BranchId, Descriptions, GasTypeId,VolumeId,PressureId) " +
                "VALUES (@GasCode, @GasName, @Volume, @Pressure, @UserId, now(), @UserIp, " +
                "@IsActive, @OrgId, @BranchId, @Descriptions, @GasTypeId,@Volumeid,@Pressureid); ";
               

            public const string updateMasterGas =
                "UPDATE master_gascode " +
                "SET GasCode = @GasCode, " +
                "GasName = @GasName, " +
                "Volume = @Volume, " +
                "Pressure = @Pressure, " +
                "LastModifiedBy = @UserId, " +
                "LastModifiedDate = now(), " +
                "LastModifiedIP = @UserIp, " +
                "IsActive = @IsActive, " +
                "OrgId = @OrgId, " +
                "BranchId = @BranchId, " +
                "Descriptions = @Descriptions, " +
                "GasTypeId = @GasTypeId, " +
                "VolumeId = @Volumeid, " +
                "PressureId = @Pressureid " +
                "WHERE Id = @Id; ";

            public const string toogleMasterGasStatus =
                "UPDATE master_gascode " +
                "SET IsActive = @IsActive " +
                "WHERE Id = @Id;";
        }

        private DynamicParameters GetDynamicParameters(int opt, string gas_name = "", string volume = "", string pressure = "", int gas_id = 0)
        {
            var param = new DynamicParameters();
            param.Add("@opt", opt);
            param.Add("@gas_Name", gas_name);

            param.Add("@volume_Name", volume);
            param.Add("@pressure_Name", pressure);

            param.Add("@gas_id", gas_id);

            return param;
        }

        private readonly IDbConnection _connection;
        public MasterGasRepository(IUnitOfWorkDB1 unitOfWork)
        {
            _connection = unitOfWork.Connection;
        }

        public async Task<object> AddAsync(MasterGas item)
        {
            var response = new ResponseModel() { Status = false };
       
            try
            {
                var result = 0;

                result = await _connection.ExecuteAsync(SQLQuery.insertMasterGas, item);
                if (result == 0)
                {
                    response = new ResponseModel() { Message = "Saving MasterGas failed 0 row", Status = false };
                    return response;
                }

                response = new ResponseModel() { Message = "Saved Successfully", Status = true };
                return response;
            }
            catch (Exception ex)
            {
                return new ResponseModel()
                {
                    Message = "Something went wrong - " + ex.Message + " - " + ex.InnerException?.Message,
                    Status = false
                };
            }
        }

        public async Task<object> GetAllAsync(string name, string volume, string pressure)
        {

            name = string.IsNullOrWhiteSpace(name) || name == "undefined" ? "" : name;
            volume = string.IsNullOrWhiteSpace(volume) ? "" : volume;
            pressure = string.IsNullOrWhiteSpace(pressure) ? "" : pressure;

            var param = GetDynamicParameters(1, name, volume, pressure);

            return await Helper.QueryProcedure(_connection, MasterGasMaster.MasterGasProcedure, param);
        }

        public async Task<object> GetByID(int id)
        {
            try
            {
                var param = GetDynamicParameters(2, gas_id: id);

                var result = await _connection.QueryAsync<MasterGas>(MasterGasMaster.MasterGasProcedure, param: param, commandType: CommandType.StoredProcedure);

                return new ResponseModel()
                {
                    Data = result,
                    Message = "Success",
                    Status = true
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel()
                {
                    Message = "Something went wrong - " + ex.Message + " - " + ex.InnerException?.Message,
                    Status = false
                };
            }
        }

        public async Task<object> UpdateAsync(MasterGas item)
        {
            var response = new ResponseModel() { Status = false };            
            try
            {
                var result = 0;

                result = await _connection.ExecuteAsync(SQLQuery.updateMasterGas, item);
                if (result == 0)
                {
                    response = new ResponseModel() { Message = "Update MasterGas failed 0 row", Status = false };
                    return response;
                }

                response = new ResponseModel() { Message = "Updated Successfully", Status = true };
                return response;
            }
            catch (Exception ex)
            {
                return new ResponseModel()
                {
                    Message = "Something went wrong - " + ex.Message + " - " + ex.InnerException?.Message,
                    Status = false
                };
            }
        }

        public async Task<object> ToogleStatus(MasterGas item)
        {
            try
            {
                var result = await _connection.ExecuteAsync(SQLQuery.toogleMasterGasStatus, item);
                if (result == 0)
                {
                    return new ResponseModel() { Message = "Toogle status MasterGas failed 0 row", Status = false };
                }
                return new ResponseModel() { Message = "Toogle status MasterGas success", Status = true };
            }
            catch (Exception ex)
            {
                return new ResponseModel()
                {
                    Message = "Something went wrong - " + ex.Message + " - " + ex.InnerException?.Message,
                    Status = false
                };
            }
        }

        public async Task<object> GetAllGasTypesAsync()
        {
            var param = GetDynamicParameters(3);

            return await Helper.QueryProcedure(_connection, MasterGasMaster.MasterGasProcedure, param);
        }

        public Task<object> GetAllAsync(string name, string volume, string pressure, string from_date, string to_date)
        {
            throw new NotImplementedException();
        }
    }

}