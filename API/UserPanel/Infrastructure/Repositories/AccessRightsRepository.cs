using BackEnd.AccessRights;
using Core.Abstractions;
using Core.AccessRights;
using Core.Models;
using Dapper;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class AccessRightsRepository : IAccessRightsRepository
    {

        private readonly IDbConnection _connection;

        public AccessRightsRepository(IUnitOfWorkDB4 financedb)
        {
            _connection = financedb.Connection;
        }

        public async Task<object> GetApprovalSettings(int userid, int branchId, Int32 orgid, Int32 screenid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 2);
                param.Add("@userid", userid);
                param.Add("@branchid", branchId);
                param.Add("@orgid", orgid);
                param.Add("@ScreenId", screenid);
                param.Add("@HeaderId", 0);

                var list = await _connection.QueryAsync(AccessRights.AccessRightsProc, param, commandType: CommandType.StoredProcedure);

                return new ResponseModel
                {
                    Data = list,
                    Message = "Success",
                    Status = true
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Data = null,
                    Message = "Error retrieving access rights.",
                    Status = false
                };
            }
        }

        public async Task<object> GetMenusDetails(int userid, int branchId, int orgid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 1);
                param.Add("@userid", userid);
                param.Add("@branchid", branchId);
                param.Add("@orgid", orgid);
                param.Add("@ScreenId", 0);
                param.Add("@HeaderId", 0);

                using var result = await _connection.QueryMultipleAsync(
                    AccessRights.AccessRightsProc,
                    param,
                    commandType: CommandType.StoredProcedure);

                var allModules = result.Read<MenuModule>()?.ToList() ?? new List<MenuModule>();
                var allScreens = result.Read<MenuScreen>()?.ToList() ?? new List<MenuScreen>();
                var homeScreen = result.Read<string>().FirstOrDefault();

                var moduleLookup = allModules.ToDictionary(m => m.ModuleId);

                // Attach screens
                foreach (var screen in allScreens)
                {
                    if (moduleLookup.TryGetValue(screen.ModuleId, out var module))
                    {
                        module.Screen ??= new List<MenuScreen>();
                        module.Screen.Add(screen);
                    }
                }

                // Sort screens
                foreach (var module in moduleLookup.Values)
                {
                    module.Screen = module.Screen?.OrderBy(s => s.MenuOrder).ToList() ?? new List<MenuScreen>();
                }

                // Build submenus but attach based on proper sorted position
                foreach (var module in allModules)
                {
                    if (module.ParentModuleId.HasValue &&
                        moduleLookup.TryGetValue(module.ParentModuleId.Value, out var parentModule) &&
                        module.Screen.Any())
                    {
                        var sortedScreens = parentModule.Screen.OrderBy(s => s.MenuOrder).ToList();

                        // Find nearest screen to attach submenu
                        var attachScreen = sortedScreens
                            .Where(s => s.MenuOrder <= module.MenuOrder)
                            .OrderByDescending(s => s.MenuOrder)
                            .FirstOrDefault() ?? sortedScreens.First();

                        attachScreen.Module ??= new List<MenuModule>();
                        attachScreen.Module.Add(module);
                    }
                }

                // Final module ordering
                foreach (var module in moduleLookup.Values)
                {
                    foreach (var s in module.Screen)
                    {
                        s.Module = s.Module?.OrderBy(m => m.MenuOrder).ToList() ?? new List<MenuModule>();
                    }
                }

                var topLevelMenus = allModules
                    .Where(m => m.ParentModuleId == null && m.Screen.Any())
                    .OrderBy(m => m.MenuOrder)
                    .ToList();

                return new ResponseModel
                {
                    Data = new MenuResponse { Menus = topLevelMenus, HomePage = homeScreen },
                    Message = "Success",
                    Status = true
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Data = null,
                    Message = ex.Message,
                    Status = false
                };
            }


        }

        public async Task<object> GetRolesAsync(int branchId, int orgId)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 3);
                param.Add("@userid", 0);
                param.Add("@branchid", branchId);
                param.Add("@orgid", orgId);
                param.Add("@ScreenId", 0);
                param.Add("@HeaderId", 0);

                var roles = await _connection.QueryAsync<RoleDropdown>(
                    AccessRights.RolesAccessProc,
                    param,
                    commandType: CommandType.StoredProcedure
                );

                return new ResponseModel
                {
                    Data = roles.ToList(),
                    Status = true,
                    Message = "Success"
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Data = null,
                    Status = false,
                    Message = $"Error retrieving roles: {ex.Message}"
                };
            }
        }

        public async Task<object> GetDepartmentsAsync(int branchId, int orgId)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 4);
                param.Add("@userid", 0);
                param.Add("@branchid", branchId);
                param.Add("@orgid", orgId);
                param.Add("@ScreenId", 0);
                param.Add("@HeaderId", 0);

                var departments = await _connection.QueryAsync<DepartmentDropdown>(
                    AccessRights.RolesAccessProc,
                    param,
                    commandType: CommandType.StoredProcedure
                );

                return new ResponseModel
                {
                    Data = departments.ToList(),
                    Status = true,
                    Message = "Success"
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Data = null,
                    Status = false,
                    Message = $"Error retrieving departments: {ex.Message}"
                };
            }
        }

        public async Task<object> GetModuleScreensAsync(int branchId, int orgId)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 5);
                param.Add("@userid", 0);
                param.Add("@branchid", branchId);
                param.Add("@orgid", orgId);
                param.Add("@ScreenId", 0);
                param.Add("@HeaderId", 0);

                var result = await _connection.QueryAsync<object>(
                    AccessRights.RolesAccessProc,
                    param,
                    commandType: CommandType.StoredProcedure
                );

                return new ResponseModel
                {
                    Data = result.ToList(),
                    Status = true,
                    Message = "Success"
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Data = null,
                    Status = false,
                    Message = $"Error retrieving module screens: {ex.Message}"
                };
            }
        }

        public async Task<object> SaveAccessRights(AccessRightsSaveRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.Role))
                    throw new ArgumentException("Invalid request");

                // 1️⃣ Insert Header (Includes DepartmentId as INT)
                var sqlInsertHeader = @"
                INSERT INTO master_accessrights_header
                (Role, Department, DepartmentId, Hod, BranchId, OrgId, IsActive, CreatedBy, CreatedDate, CreatedIP, EffectiveFrom, RoleId)
                VALUES
                (@Role, @Department, @DepartmentId, @Hod, @BranchId, @OrgId, @IsActive, @CreatedBy, @CreatedDate, @CreatedIP, @EffectiveFrom, @RoleId );

                SELECT LAST_INSERT_ID();";

                int headerId = await _connection.ExecuteScalarAsync<int>(
                    sqlInsertHeader,
                    new
                    {
                        Role = request.Role,
                        Department = request.Department,
                        DepartmentId = request.DepartmentId,
                        Hod = request.IsHOD,
                        BranchId = 1,
                        OrgId = 1,
                        IsActive = 1,
                        CreatedBy = 0,
                        CreatedDate = DateTime.Now,
                        CreatedIP = "",
                        EffectiveFrom = request.EffectiveDate ?? DateTime.Now,
                        RoleId = request.RoleId
                    }
                );


                var sqlInsertDetail = @"
                INSERT INTO master_accessrights_details
                (HeaderId, Module, Screen, `View`, `Edit`, `Delete`, `Post`, `Save`, `Print`, ViewRate, SendMail, ViewDetails, Records, IsActive)
                VALUES
                (@HeaderId, @Module, @Screen, @View, @Edit, @Delete, @Post, @Save, @Print, @ViewRate, @SendMail, @ViewDetails, @Records, @IsActive);";

                foreach (var module in request.Modules)
                {
                    foreach (var screen in module.Screens)
                    {
                        var p = screen.Permissions;

                        await _connection.ExecuteAsync(
                            sqlInsertDetail,
                            new
                            {
                                HeaderId = headerId,
                                Module = module.ModuleName,
                                Screen = screen.ScreenName,
                                View = p.View,
                                Edit = p.Edit,
                                Delete = p.Delete,
                                Post = p.Post,
                                Save = p.Save,
                                Print = p.Print,
                                ViewRate = p.ViewRate,
                                SendMail = p.SendMail,
                                ViewDetails = p.ViewDetails,
                                Records = p.RecordsPerPage,
                                IsActive = true
                            }
                        );
                    }
                }

                return new
                {
                    HeaderId = headerId,
                    role = request.Role,
                    department = request.Department,
                    departmentId = request.DepartmentId,
                    effectiveDate = request.EffectiveDate,
                    isHOD = request.IsHOD,
                    roleId = request.RoleId,
                    modules = request.Modules
                };
            }
            catch (Exception ex)
            {
                return new
                {
                    Status = false,
                    Message = $"Error saving access rights: {ex.Message}",
                    Data = (object?)null
                };
            }
        }


        public async Task<object> UpdateAccessRights(AccessRightsSaveRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Role))
                return new ResponseModel
                {
                    Status = false,
                    Message = "Invalid request for update",
                    Data = null
                };

            if (request.HeaderId <= 0)
                return new ResponseModel
                {
                    Status = false,
                    Message = "Invalid HeaderId for update",
                    Data = null
                };

            int headerId = request.HeaderId;

            // Get current IsActive from header
            var dbIsActive = await _connection.ExecuteScalarAsync<int>(
            "SELECT IsActive FROM master_accessrights_header WHERE Id = @Id",
            new { Id = headerId });

            // Correct logic → set to 1 or 0 based on request
            int finalIsActive = request.IsActive.HasValue
            ? (request.IsActive.Value ? 1 : 0)
            : dbIsActive;

            // Update header table
            var sqlUpdateHeader = @"
        UPDATE master_accessrights_header
        SET 
            Role = @Role,
            Department = @Department,
            Hod = @Hod,
            BranchId = @BranchId,
            OrgId = @OrgId,
            ModifiedBy = @ModifiedBy,
            LastModifiedDate = @LastModifiedDate,
            ModifiedIP = @ModifiedIP,
            EffectiveFrom = @EffectiveFrom,
            IsActive = @FinalIsActive
        WHERE Id = @Id;
    ";

            // Insert detail row
            var sqlInsertDetail = @"
        INSERT INTO master_accessrights_details
        (HeaderId, Module, Screen, `View`, `Edit`, `Delete`, `Post`, `Save`, `Print`,
         ViewRate, SendMail, ViewDetails, Records, IsActive)
        VALUES
        (@HeaderId, @Module, @Screen, @View, @Edit, @Delete, @Post, @Save, @Print,
         @ViewRate, @SendMail, @ViewDetails, @Records, @IsActive);
    ";

            try
            {
                // Update header
                await _connection.ExecuteAsync(sqlUpdateHeader, new
                {
                    Id = headerId,
                    Role = request.Role,
                    Department = request.Department,
                    Hod = request.IsHOD,
                    BranchId = 1,
                    OrgId = 1,
                    ModifiedBy = 0,
                    LastModifiedDate = DateTime.Now,
                    ModifiedIP = "",
                    EffectiveFrom = request.EffectiveDate ?? DateTime.Now,
                    FinalIsActive = finalIsActive,
                });

                // LOOP modules + screens
                foreach (var module in request.Modules)
                {
                    foreach (var screen in module.Screens)
                    {
                        var p = screen.Permissions;

                        // Check if detail row already exists
                        var existingCount = await _connection.ExecuteScalarAsync<int>(@"
                    SELECT COUNT(*) FROM master_accessrights_details
                    WHERE HeaderId = @HeaderId AND Module = @Module AND Screen = @Screen
                ", new
                        {
                            HeaderId = headerId,
                            Module = module.ModuleName,
                            Screen = screen.ScreenName
                        });

                        // Check if all permissions false
                        bool allFalse =
                            !p.View && !p.Edit && !p.Delete && !p.Post &&
                            !p.Save && !p.Print && !p.ViewRate &&
                            !p.SendMail && !p.ViewDetails;

                        // DELETE only if the row existed earlier
                        if (allFalse)
                        {
                            if (existingCount > 0)
                            {
                                await _connection.ExecuteAsync(@"
                            DELETE FROM master_accessrights_details
                            WHERE HeaderId = @HeaderId AND Module = @Module AND Screen = @Screen
                        ", new
                                {
                                    HeaderId = headerId,
                                    Module = module.ModuleName,
                                    Screen = screen.ScreenName
                                });
                            }

                            // Skip insert/update
                            continue;
                        }

                        // If exists → UPDATE
                        if (existingCount > 0)
                        {
                            await _connection.ExecuteAsync(@"
                        UPDATE master_accessrights_details
                        SET 
                            `View` = @View,
                            `Edit` = @Edit,
                            `Delete` = @Delete,
                            `Post` = @Post,
                            `Save` = @Save,
                            `Print` = @Print,
                            ViewRate = @ViewRate,
                            SendMail = @SendMail,
                            ViewDetails = @ViewDetails,
                            Records = @Records,
                            IsActive = 1
                        WHERE HeaderId = @HeaderId AND Module = @Module AND Screen = @Screen
                    ", new
                            {
                                HeaderId = headerId,
                                Module = module.ModuleName,
                                Screen = screen.ScreenName,
                                View = p.View,
                                Edit = p.Edit,
                                Delete = p.Delete,
                                Post = p.Post,
                                Save = p.Save,
                                Print = p.Print,
                                ViewRate = p.ViewRate,
                                SendMail = p.SendMail,
                                ViewDetails = p.ViewDetails,
                                Records = p.RecordsPerPage
                            });
                        }
                        else
                        {
                            // If not exists → INSERT
                            await _connection.ExecuteAsync(sqlInsertDetail, new
                            {
                                HeaderId = headerId,
                                Module = module.ModuleName,
                                Screen = screen.ScreenName,
                                View = p.View,
                                Edit = p.Edit,
                                Delete = p.Delete,
                                Post = p.Post,
                                Save = p.Save,
                                Print = p.Print,
                                ViewRate = p.ViewRate,
                                SendMail = p.SendMail,
                                ViewDetails = p.ViewDetails,
                                Records = p.RecordsPerPage,
                                IsActive = true
                            });
                        }
                    }
                }

                // SUCCESS response
                return new ResponseModel
                {
                    Status = true,
                    Message = "Access rights updated successfully",
                    Data = new
                    {
                        HeaderId = headerId,
                        role = request.Role,
                        department = request.Department,
                        departmentId = request.DepartmentId,
                        effectiveDate = request.EffectiveDate,
                        isHOD = request.IsHOD,
                        roleId = request.RoleId,
                        isActive = finalIsActive,
                        modules = request.Modules
                    }
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Status = false,
                    Message = $"Error updating access rights: {ex.Message}",
                    Data = null
                };
            }
        }




        public async Task<object> GetAccessRightsByBranchOrg(int branchId, int orgId)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 6);
                param.Add("@userid", 0);
                param.Add("@branchid", branchId);
                param.Add("@orgid", orgId);
                param.Add("@ScreenId", 0);
                param.Add("@HeaderId", 0);

                // Fetch flat data from SP
                var flatList = (await _connection.QueryAsync<dynamic>(
                    AccessRights.RolesAccessProc,
                    param,
                    commandType: CommandType.StoredProcedure
                )).ToList();

                bool ConvertToBool(object val)
                {
                    if (val == null) return false;
                    try
                    {
                        return Convert.ToInt32(val) == 1;
                    }
                    catch
                    {
                        return false;
                    }
                }


                var groupedHeaders = flatList
                    .GroupBy(h => new
                    {
                        HeaderId = (int)h.HeaderId,
                        Role = (string)h.Role,
                        Department = (string)h.Department,
                        Hod = ConvertToBool(h.Hod),
                        EffectiveFrom = (DateTime)h.EffectiveFrom,
                        IsActive = ConvertToBool(h.IsActive)
                    })
                    .Select(headerGroup => new
                    {
                        headerId = headerGroup.Key.HeaderId,
                        role = headerGroup.Key.Role,
                        department = headerGroup.Key.Department,
                        effectiveDate = headerGroup.Key.EffectiveFrom,
                        isHOD = headerGroup.Key.Hod,
                        isActive = headerGroup.Key.IsActive,
                        modules = headerGroup
                            .GroupBy(m => (string)m.Module)
                            .Select(moduleGroup => new
                            {
                                moduleName = moduleGroup.Key,
                                screens = moduleGroup.Select(s => new
                                {
                                    screenName = (string)s.Screen,
                                    permissions = new
                                    {
                                        view = ConvertToBool(s.View),
                                        edit = ConvertToBool(s.Edit),
                                        delete = ConvertToBool(s.Delete),
                                        post = ConvertToBool(s.Post),
                                        save = ConvertToBool(s.Save),
                                        print = ConvertToBool(s.Print),
                                        viewRate = ConvertToBool(s.ViewRate),
                                        sendMail = ConvertToBool(s.SendMail),
                                        viewDetails = ConvertToBool(s.ViewDetails),
                                        recordsPerPage = (int)s.Records
                                    }
                                }).ToList()
                            }).ToList()
                    }).ToList();

                return new ResponseModel
                {
                    Data = groupedHeaders,
                    Status = true,
                    Message = "Access rights retrieved successfully"
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Status = false,
                    Message = $"Error retrieving access rights: {ex.Message}",
                    Data = null
                };
            }
        }






        public async Task<object> GetAccessRightsDetailById(int headerId)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 7);
                param.Add("@userid", 0);
                param.Add("@branchid", 0);
                param.Add("@orgid", 0);
                param.Add("@ScreenId", 0);
                param.Add("@HeaderId", headerId);

                var flatList = (await _connection.QueryAsync<dynamic>(
                    AccessRights.RolesAccessProc,
                    param,
                    commandType: CommandType.StoredProcedure
                )).ToList();

                var groupedHeader = flatList
                    .GroupBy(h => new
                    {
                        HeaderId = (int)h.HeaderId,
                        Role = (string)h.Role,
                        Department = (string)h.Department,
                        Hod = (bool)h.Hod,
                        IsActive = Convert.ToBoolean(h.IsActive),
                        EffectiveFrom = (DateTime)h.EffectiveFrom
                    })
                    .Select(headerGroup => new AccessRightsSaveRequest
                    {
                        HeaderId = headerGroup.Key.HeaderId,
                        Role = headerGroup.Key.Role,
                        Department = headerGroup.Key.Department,
                        EffectiveDate = headerGroup.Key.EffectiveFrom,
                        IsHOD = headerGroup.Key.Hod,
                        IsActive = headerGroup.Key.IsActive,
                        Modules = headerGroup
                            .GroupBy(m => (string)m.Module)
                            .Select(moduleGroup => new ModuleScreens
                            {
                                ModuleName = moduleGroup.Key,
                                Screens = moduleGroup.Select(s => new ScreenPermissions
                                {
                                    ScreenName = (string)s.Screen,
                                    Permissions = new Permissions
                                    {
                                        View = (bool)s.View,
                                        Edit = (bool)s.Edit,
                                        Delete = (bool)s.Delete,
                                        Post = (bool)s.Post,
                                        Save = (bool)s.Save,
                                        Print = (bool)s.Print,
                                        ViewRate = (bool)s.ViewRate,
                                        SendMail = (bool)s.SendMail,
                                        ViewDetails = (bool)s.ViewDetails,
                                        RecordsPerPage = (int)s.Records
                                    }
                                }).ToList()
                            }).ToList()
                    }).FirstOrDefault();

                return new ResponseModel
                {
                    Data = groupedHeader,
                    Status = true,
                    Message = "Access rights details retrieved successfully"
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Status = false,
                    Message = $"Error retrieving access rights details: {ex.Message}",
                    Data = null
                };
            }
        }



        public async Task<object> GetUserRoleDeptMappedAsync(int userId, int branchId, int orgId)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 9);
                param.Add("@userid", userId);
                param.Add("@branchid", branchId);
                param.Add("@orgid", orgId);
                param.Add("@ScreenId", 0);
                param.Add("@HeaderId", 0);

                // RETURN RAW SP RESULT
                var list = await _connection.QueryAsync(
                    AccessRights.RolesAccessProc,
                    param,
                    commandType: CommandType.StoredProcedure
                );

                return new ResponseModel
                {
                    Data = list,
                    Message = "Success",
                    Status = true
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Data = null,
                    Message = $"Error retrieving mapped access. {ex.Message}",
                    Status = false
                };
            }
        }



    }
}
