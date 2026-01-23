using Core.Abstractions;
using Core.Master.ErrorLog;
using Dapper;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class ErrorLogMasterRepository : IErrorLogMasterRepository
    {
        private readonly IDbConnection _connection;

        public ErrorLogMasterRepository(IUnitOfWorkDB4 unitOfWork)
        {
            _connection = unitOfWork.Connection;    
        }

        public async Task<object> LogErrorAsync(ErrorLogMasterModel error)
        {
            try
            {
                string insertQuery = @"
                INSERT INTO master_CommonErrorLogs
                (ErrorMessage, ErrorType, StackTrace, Source, Method_Function, InnerException,
                 UserId, ScreenId, ScreenName, ModuleId, ModuleName, RequestData_Payload,
                 CreatedDate, ModifiedDate, IsActive, Environment, ServerName, ErrorCode)
                VALUES
                (@ErrorMessage, @ErrorType, @StackTrace, @Source, @Method_Function, @InnerException,
                 @UserId, @ScreenId, @ScreenName, @ModuleId, @ModuleName, @RequestData_Payload,
                 @CreatedDate, @ModifiedDate, @IsActive, @Environment, @ServerName, @ErrorCode);
            ";

                // Auto-fill system values (no repeating in caller)
                error.CreatedDate = DateTime.UtcNow;
                error.ModifiedDate = DateTime.UtcNow;
                error.IsActive = 1;
                error.Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
                error.ServerName = Environment.MachineName;

                await _connection.ExecuteAsync(insertQuery, error);

                return new { Status = true, Message = "Error logged successfully" };
            }
            catch (Exception ex)
            {
                return new { Status = false, Message = ex.Message };
            }
        }
    }
}
