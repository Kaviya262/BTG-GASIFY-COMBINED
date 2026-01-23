using System.Data;
using BackEnd.Master;
using Core.Abstractions;
using Core.Master.Cylinder;
using Core.Models;
using Dapper;
using UserPanel.Infrastructure.Data;

namespace Infrastructure.Repositories
{
    public class MasterCylinderRepository : IMasterCylinderRepository
    {
        static class SQLQuery
        {
            public const string GetLastInsertedIdSql = "SELECT LAST_INSERT_ID();";

            public const string insertMasterCylinder =
                "INSERT INTO master_cylinder (" +
                "barcode, cylindername, cylindernumber, GasCodeId, cylindertypeid, ownershipid, testedon, nexttestdate, remarks, " +
                "CreatedDate, CreatedIP, IsActive, CreatedBy, BranchId, OrgId, StatusId, location, hscode, IsDelivered, manufacturer, " +
                "workingpressure, palletBarcode, palletRegNumber, docNumber, fileName, fileData, testedMonth, testedYear,gasdescription,cylindersize" +
                ") VALUES (" +
                "@barcode, @cylindercode, @cylindernumber, @GasCodeId, @cylindertypeid, @ownershipid, @testedon, @nexttestdate, @remarks, " +
                "now(), @UserIp, 1, @UserId, @BranchId, @OrgId, @StatusId, @location, @hscode, @IsDelivered, @manufacturer, " +
                "@workingpressure, @palletBarcode, @palletRegNumber, @docNumber, @fileName, @fileData, @testedMonth, @testedYear,@gasdescription,@cylindersize" +
                ");";
            public const string updateMasterCylinder =
    "UPDATE master_cylinder SET " +
    "barcode = @barcode, " +
    "gasdescription = @gasdescription, " +
    "cylindername = @cylindercode, " +
    "cylindernumber = @cylindernumber, " +
    "GasCodeId = @GasCodeId, " +
    "cylindersize = @CylinderSize, " +  // ✅ added missing comma
    "cylindertypeid = @cylindertypeid, " +
    "ownershipid = @ownershipid, " +
    "testedon = @testedon, " +
    "nexttestdate = @nexttestdate, " +
    "remarks = @remarks, " +
    "LastModifiedBy = @UserId, " +
    "LastModifiedDate = Now(), " +
    "LastModifiedIP = @UserIp, " +
    "IsActive = @IsActive, " +
    "BranchId = @BranchId, " +
    "OrgId = @OrgId, " +
    "StatusId = @StatusId, " +
    "location = @location, " +
    "hscode = @hscode, " +
    "IsDelivered = @IsDelivered, " +
    "manufacturer = @manufacturer, " +
    "workingpressure = @workingpressure, " +
    "palletBarcode = @palletBarcode, " +
    "palletRegNumber = @palletRegNumber, " +
    "docNumber = @docNumber, " +
    "fileName = @fileName, " +
    "fileData = @fileData, " +
    "testedMonth = @testedMonth, " +
    "testedYear = @testedYear " +
    "WHERE cylinderid = @cylinderid;";


            public const string toogleMasterCylinderStatus =
                "UPDATE master_cylinder " +
                "SET IsActive = @IsActive " +
                "WHERE cylinderid = @Cylinderid;";
        }


        private DynamicParameters GetDynamicParameters(int opt, string cylinder_name = "", string from_date = "", string to_date = "", int cylinder_id = 0)
        {
            var param = new DynamicParameters();
            param.Add("@opt", opt);
            param.Add("@cylinder_Name", cylinder_name);
            param.Add("@from_date", from_date);
            param.Add("@to_date", to_date);
            param.Add("@cylinder_id", cylinder_id);

            return param;
        }

        private readonly IDbConnection _connection;
        public MasterCylinderRepository(IUnitOfWorkDB1 unitOfWork)
        {
            _connection = unitOfWork.Connection;
        }

        public async Task<object> AddAsync(MasterCylinder item)
        {
            var response = new ResponseModel() { Status = false };
            
            try
            {
                var result = 0;

                if (item.Cylinderid > 0)
                {

                    result = await _connection.ExecuteAsync(SQLQuery.updateMasterCylinder, item);

                    if (result == 0)
                    {
                        response = new ResponseModel() { Message = "Update MasterCylinder failed, 0 row affected", Status = false };
                        return response;
                    }

                    response = new ResponseModel() { Message = "Updated Successfully", Status = true };
                    return response;
                }
                else
                {

                    result = await _connection.ExecuteAsync(SQLQuery.insertMasterCylinder, item);

                    if (result == 0)
                    {
                        response = new ResponseModel() { Message = "Saving MasterCylinder failed, 0 row affected", Status = false };
                        return response;
                    }

                    response = new ResponseModel() { Message = "Saved Successfully", Status = true };
                    return response;
                }

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

        public async Task<object> GetByID(int id)
        {
            try
            {
                var param = GetDynamicParameters(2, cylinder_id: id);

                var result = await _connection.QueryAsync<MasterCylinder>(MasterCylinderMaster.MasterCylinderProcedure, param: param, commandType: CommandType.StoredProcedure);

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

        public async Task<object> GetAllAsync(string name, string from_date, string to_date)
        {
            var param = GetDynamicParameters(1, name, from_date, to_date);

            return await Helper.QueryProcedure(_connection, MasterCylinderMaster.MasterCylinderProcedure, param);
        }

        public async Task<object> UpdateAsync(MasterCylinder item)
        {
            var response = new ResponseModel() { Status = false };
            
            try
            {
                var result = 0;

                result = await _connection.ExecuteAsync(SQLQuery.updateMasterCylinder, item);
                if (result == 0)
                {
                    response = new ResponseModel() { Message = "Update MasterCylinder failed 0 row", Status = false };
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

        public async Task<object> ToogleStatus(MasterCylinder item)
        {
            try
            {

                var result = await _connection.ExecuteAsync(SQLQuery.toogleMasterCylinderStatus, item);

                if (result == 0)
                {
                    return new ResponseModel() { Message = "Toggle status failed, 0 row affected", Status = false };
                }

                return new ResponseModel()
                {
                    Message = $"Status updated successfully to {(item.IsActive ? "Active" : "Inactive")}",
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

    }
}
