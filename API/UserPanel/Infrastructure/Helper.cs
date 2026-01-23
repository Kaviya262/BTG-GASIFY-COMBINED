using BackEnd.Master;
using Core.Models;
using Dapper;
using System.Data;
using System.Data.Common;

namespace Infrastructure
{
    public static class Helper
    {
        public static async Task<object> RunQueryProcedure<T>(IDbConnection _connection, string procedureName, DynamicParameters param)
        {
            var List = await _connection.QueryAsync<T>(procedureName, param: param, commandType: CommandType.StoredProcedure);

            return List.ToList();
        }

        public static async Task<object> RunQueryProcedure(IDbConnection _connection, string procedureName, DynamicParameters param)
        {
            var List = await _connection.QueryAsync(procedureName, param: param, commandType: CommandType.StoredProcedure);

            return List.ToList();
        }
        public static async Task<object> QueryProcedure(IDbConnection _connection, string procedureName, DynamicParameters param)
        {
            try
            {
                var Modellist = await Helper.RunQueryProcedure(_connection, procedureName, param);

                return new ResponseModel()
                {
                    Data = Modellist,
                    Message = "Success",
                    Status = true
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went wrong - " + ex.Message + " - " + ex.InnerException?.Message,
                    Status = false
                };
            }
        }
    }
}
