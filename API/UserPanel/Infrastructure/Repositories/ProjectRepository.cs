using BackEnd.Procurement.Master;
using Core.Abstractions;
using Core.Models;
using Core.Procurement.Master;
using Dapper;
using DocumentFormat.OpenXml.Spreadsheet;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class ProjectRepository : IProjectRepository
    {
        private readonly IDbConnection _connection;

        public ProjectRepository(IUnitOfWorkDB4 masterDb)
        {
            _connection = masterDb.Connection;
        }

        public async Task<object> AddAsync(MasterProject obj)
        {
            try
            {

                var param = new DynamicParameters();
                param.Add("@opt", 1); // Add
                param.Add("@project_id", 0);
                param.Add("@project_Code", "");
                param.Add("@project_Name", "");
                param.Add("@user_id", 0);
                param.Add("@org_id", obj.orgid);
                param.Add("@branch_id", obj.branchid);
                param.Add("@json_project", JsonConvert.SerializeObject(obj));

                var result = await _connection.QueryFirstOrDefaultAsync<object>(
                    ProjectBackEnd.ProjectsProcedure, param, commandType: CommandType.StoredProcedure);

              

                return new ResponseModel
                {
                    Data = result,
                    Message = "Project saved successfully",
                    Status = true
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Data = null,
                    Message = "Error saving project: " + ex.Message,
                    Status = false
                };
            }
        }

        public async Task<object> UpdateAsync(MasterProject obj)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 2); // Update
                param.Add("@project_id", obj.projectid);
                param.Add("@project_Code", "");
                param.Add("@project_Name", "");
                param.Add("@user_id", 0);
                param.Add("@org_id", obj.orgid);
                param.Add("@branch_id", obj.branchid);
                param.Add("@json_project", JsonConvert.SerializeObject(obj));

                var result = await _connection.QueryFirstOrDefaultAsync<object>(
                    ProjectBackEnd.ProjectsProcedure, param, commandType: CommandType.StoredProcedure);

                return new ResponseModel
                {
                    Data = result,
                    Message = "Project updated successfully",
                    Status = true
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Data = null,
                    Message = "Error updating project: " + ex.Message,
                    Status = false
                };
            }
        }

        public async Task<object> GetProjectByIdAsync(int projectid, int branchid, int orgid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 3); // Get by ID
                param.Add("@project_id", projectid);
                param.Add("@project_Code", "");
                param.Add("@project_Name", "");
                param.Add("@user_id", 0);
                param.Add("@org_id", orgid);
                param.Add("@branch_id", branchid);
                param.Add("@json_project", "{}");

                var result = await _connection.QueryMultipleAsync(
                    ProjectBackEnd.ProjectsProcedure, param, commandType: CommandType.StoredProcedure);

                var header = await result.ReadFirstOrDefaultAsync<object>();

                return new ResponseModel
                {
                    Data = new { Header = header },
                    Message = "Success",
                    Status = true
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Data = null,
                    Message = "Error retrieving project: " + ex.Message,
                    Status = false
                };
            }
        }

        public async Task<object> GetListProjectAsync(string projectcode,string projectname,int userid,int branchid, int orgid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 4); // List
                param.Add("@project_id", 0);
                param.Add("@project_Code", projectcode);
                param.Add("@project_Name", projectname);
                param.Add("@user_id", userid);
                param.Add("@org_id", orgid);
                param.Add("@branch_id", branchid);
                param.Add("@json_project", "{}");


                var result = await _connection.QueryAsync<object>(
                    ProjectBackEnd.ProjectsProcedure, param, commandType: CommandType.StoredProcedure);

                return new ResponseModel
                {
                    Data = result,
                    Message = "Success",
                    Status = true
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Data = null,
                    Message = "Error retrieving project list: " + ex.Message,
                    Status = false
                };
            }
        }

       
      

    }

}
