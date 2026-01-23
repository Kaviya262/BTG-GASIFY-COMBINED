using BackEnd.Master;
using Core.Master.Pallet;
using Core.Models;
using Core.OrderMngMaster.Customer;
using Dapper;
using Newtonsoft.Json;
using System.Data;
using System.Text.Json.Serialization;
using System.Text.Json;
using UserPanel.Infrastructure.Data;
using Core.Abstractions;

namespace Infrastructure.Repositories
{
    public class MasterPalletRepository : IMasterPalletRepository
    {
        class WrapperGetByID
        {
            public MasterPallet mp { get; set; }
            public MasterPalletitem mpi { get; set; }
        }

        static class SQLQuery
        {
            public const string GetLastInsertedIdSql = "SELECT LAST_INSERT_ID();";

            // INSERT: master_pallet with PalletNumber included
            public const string insertMasterPallet =
                "INSERT INTO master_pallet(PalletId, PalletName, PalletNumber, GasCodeId, ContainerId, CreatedBy, CreatedDate, CreatedIP, " +
                "IsActive, OrgId, BranchId) " +
                "VALUES (@PalletId, @PalletName, @PalletNumber, @GasCodeId, @ContainerId, @UserId, now(), @UserIP, " +
                "@IsActive, @OrgId, @BranchId);";

            // INSERT: master_palletitems with CylinderName, OwnershipName, Barcode
            public const string insertMasterPalletItems =
                "INSERT INTO master_palletitems(PalletItemId, PalletId, PalletItemPos, CylinderId, CylinderName, OwnershipName, Barcode, " +
                "CreatedBy, CreatedDate, CreatedIP, IsActive, OrgId, BranchId) " +
                "VALUES (@PalletItemId, @PalletId, @PalletItemPos, @CylinderId, @CylinderName, @OwnershipName, @Barcode, " +
                "@UserId, now(), @UserIP, @IsActive, @OrgId, @BranchId);";

            // UPDATE: master_pallet with PalletNumber included
            public const string updateMasterPallet =
                "UPDATE master_pallet " +
                "SET PalletName = @PalletName, " +
                "PalletNumber = @PalletNumber, " +
                "GasCodeId = @GasCodeId, " +
                "ContainerId = @ContainerId, " +
                "LastModifiedBy = @UserId, " +
                "LastModifiedDate = now(), " +
                "LastModifiedIP = @UserIP, " +
                "IsActive = @IsActive, " +
                "OrgId = @OrgId, " +
                "BranchId = @BranchId " +
                "WHERE PalletId = @PalletId;";

            // UPDATE: master_palletitems with CylinderName, OwnershipName, Barcode
            public const string updateMasterPalletItems =
                "UPDATE master_palletitems " +
                "SET PalletId = @PalletId, " +
                "PalletItemPos = @PalletItemPos, " +
                "CylinderId = @CylinderId, " +
                "CylinderName = @CylinderName, " +
                "OwnershipName = @OwnershipName, " +
                "Barcode = @Barcode, " +
                "LastModifiedBy = @UserId, " +
                "LastModifiedDate = now(), " +
                "LastModifiedIP = @UserIP, " +
                "IsActive = @IsActive, " +
                "OrgId = @OrgId, " +
                "BranchId = @BranchId " +
                "WHERE PalletItemId = @PalletItemId;";

            // TOGGLE: master_pallet status
            public const string toogleMasterPalletStatus =
                "UPDATE master_pallet " +
                "SET IsActive = @IsActive " +
                "WHERE PalletId = @PalletId;";

            // TOGGLE: master_palletitems status
            public const string toogleMasterPalletItemsStatus =
                "UPDATE master_palletitems " +
                "SET IsActive = @IsActive " +
                "WHERE PalletItemId = @PalletItemId;";
        }



        private DynamicParameters GetDynamicParameters(int opt, string gas_name = "", string containerType_name = "", int pallet_id = 0)
        {
            var param = new DynamicParameters();
            param.Add("@opt", opt);
            param.Add("@gas_Name", gas_name);
            param.Add("@containerType_name", containerType_name);
            param.Add("@pallet_id", pallet_id);

            return param;
        }

        private readonly IDbConnection _connection;
        public MasterPalletRepository(IUnitOfWorkDB1 unitOfWork)
        {
            _connection = unitOfWork.Connection;
        }

        public async Task<object> AddAsync(MasterPalletModel item)
        {
            var response = new ResponseModel() { Status = false };

            try
            {
                var options = new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                    DefaultIgnoreCondition = JsonIgnoreCondition.Never
                };

                var palletItemsJson = System.Text.Json.JsonSerializer.Serialize(item.PalletItems, options);

                var parameters = new DynamicParameters();
                parameters.Add("p_PalletId", item.Pallet.PalletId);
                parameters.Add("p_PalletTypeID", item.Pallet.PalletTypeId);
                parameters.Add("p_PalletName", item.Pallet.PalletName);
                parameters.Add("p_PalletNumber", item.Pallet.PalletNumber);
                parameters.Add("p_GasCodeId", item.Pallet.GasCodeId);
                parameters.Add("p_ContainerId", item.Pallet.ContainerId);
                parameters.Add("p_UserId", item.Pallet.UserId);
                parameters.Add("p_UserIP", item.Pallet.UserIP);
                parameters.Add("p_IsActive", item.Pallet.IsActive);
                parameters.Add("p_OrgId", item.Pallet.OrgId);
                parameters.Add("p_BranchId", item.Pallet.BranchId);
                parameters.Add("p_Barcode", item.Pallet.Barcode);
                parameters.Add("p_PalletItemsJSON", palletItemsJson);
                parameters.Add("p_ResultCode", dbType: DbType.Int32, direction: ParameterDirection.Output);

                await _connection.ExecuteAsync(
                    "proc_SaveOrUpdateMasterPalletWithItems",
                    parameters,
                    commandType: CommandType.StoredProcedure
                );

                int resultCode = parameters.Get<int>("p_ResultCode");

                response = new ResponseModel()
                {
                    Message = "Saved successfully, result code: " + resultCode,
                    Status = true
                };
            }
            catch (Exception ex)
            {
                response = new ResponseModel()
                {
                    Message = $"Something went wrong - {ex.Message} - {ex.InnerException?.Message}",
                    Status = false
                };
            }

            return response;
        }



        public async Task<object> GetByID(int palletId, int orgId, int branchId)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("p_PalletId", palletId);
                param.Add("p_OrgId", orgId);
                param.Add("p_BranchId", branchId);

                using var multi = await _connection.QueryMultipleAsync(
                    "proc_GetByPalletId",
                    param,
                    commandType: CommandType.StoredProcedure);

                var mp = await multi.ReadFirstOrDefaultAsync<MasterPallet>();
                var mpi = (await multi.ReadAsync<MasterPalletitem>()).ToList();

                if (mp == null)
                {
                    return new ResponseModel()
                    {
                        Message = "MasterPallet not found",
                        Status = false
                    };
                }

                var model = new MasterPalletModel
                {
                    Pallet = mp,
                    PalletItems = mpi
                };

                return new ResponseModel()
                {
                    Data = model,
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


        public async Task<object> GetAllAsync(int orgId, int branchId, int? palletTypeId, int? GasCodeId)
        {
            var parameters = new DynamicParameters();
            parameters.Add("p_OrgId", orgId);
            parameters.Add("p_BranchId", branchId);
            parameters.Add("p_PalletTypeID", palletTypeId ?? 0);
            parameters.Add("p_GasCodeId", GasCodeId ?? 0);

            return await Helper.QueryProcedure(_connection, "proc_GetMasterPalletList_Filtered", parameters);
        }


        public async Task<object> UpdateAsync(MasterPalletModel item)
        {
            var response = new ResponseModel() { Status = false };
            _connection.Open();
            var _transaction = _connection.BeginTransaction();

            try
            {
                var result = 0;

                result = await _connection.ExecuteAsync(SQLQuery.updateMasterPallet, item.Pallet);
                if (result == 0)
                {
                    response = new ResponseModel() { Message = "Update MasterPallet failed 0 row", Status = false };
                    return response;
                }

                //get current all pallet items id of current palet
                var param = GetDynamicParameters(3, pallet_id: item.Pallet.PalletId);
                var currentPalletItemsIds = (List<int>)await Helper.RunQueryProcedure<int>(_connection, MasterPalletMaster.MasterPalletProcedure, param);

                foreach (var palletItem in item.PalletItems)
                {
                    if (currentPalletItemsIds.Contains(palletItem.PalletItemId))
                    {
                        result = await _connection.ExecuteAsync(SQLQuery.updateMasterPalletItems, palletItem);
                        if (result == 0)
                        {
                            response = new ResponseModel() { Message = "Update MasterPalletItem failed 0 row", Status = false };
                            return response;
                        }
                    }
                    else
                    {
                        result = await _connection.ExecuteAsync(SQLQuery.insertMasterPalletItems, palletItem);
                        if (result == 0)
                        {
                            response = new ResponseModel() { Message = "Insert MasterPalletItem failed 0 row", Status = false };
                            return response;
                        }
                    }
                }

                //get pallet item ids in DB but not in input data
                var inputPalletItemIds = item.PalletItems.Select(i => i.PalletItemId).ToList();
                var idsNotInInput = currentPalletItemsIds.Where(i => !inputPalletItemIds.Contains(i)).ToList();

                //toogle not found data to inactive
                foreach (var id in idsNotInInput)
                {
                    var tempPalletItem = new MasterPalletitem();
                    tempPalletItem.PalletItemId = id;
                    tempPalletItem.IsActive = false;
                    result = await _connection.ExecuteAsync(SQLQuery.toogleMasterPalletItemsStatus, tempPalletItem);
                    if (result == 0)
                    {
                        response = new ResponseModel() { Message = "Toogle Status MasterPalletItem failed 0 row", Status = false };
                        return response;
                    }
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
            finally
            {
                if (response.Status)
                {
                    _transaction.Commit();
                }
                else
                {
                    _transaction.Rollback();
                }
            }
        }

        public async Task<object> ToogleStatus(MasterPallet item)
        {
            var response = new ResponseModel { Status = false };

            try
            {
                var parameters = new DynamicParameters();
                parameters.Add("p_PalletId", item.PalletId);
                parameters.Add("p_IsActive", item.IsActive);
                parameters.Add("p_UserId", item.UserId);
                parameters.Add("p_UserIP", item.UserIP);

                var result = await _connection.ExecuteAsync(
                    "proc_UpdatePalletStatusById",
                    parameters,
                    commandType: CommandType.StoredProcedure
                );

                if (result == 0)
                {
                    response.Message = "Toggle status failed: No rows affected.";
                    return response;
                }

                response.Status = true;
                response.Message = "Toggle status successful.";
                return response;
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Message = $"Something went wrong - {ex.Message} - {ex.InnerException?.Message}",
                    Status = false
                };
            }
        }

    }
}

