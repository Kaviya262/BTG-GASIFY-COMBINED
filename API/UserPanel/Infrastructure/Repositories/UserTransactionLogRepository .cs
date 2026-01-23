using Core.Abstractions;
using Core.Master.Transactionlog;
using Dapper;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class UserTransactionLogRepository : IUserTransactionLogRepository
    {
        private readonly IDbConnection _masterDb;   // DB4
        private readonly IDbConnection _claimDb;    // DB3
        private readonly IDbConnection _purchaseDb; // DB2
        private readonly IDbConnection _salesDb;

        public UserTransactionLogRepository(IUnitOfWorkDB4 masterDb, IUnitOfWorkDB3 claimDb, IUnitOfWorkDB2 purchaseDb, IUnitOfWorkDB1 salesDb)
        {
            _masterDb = masterDb.Connection;
            _claimDb = claimDb.Connection;
            _purchaseDb = purchaseDb.Connection;
            _salesDb = salesDb.Connection;
        }

        public async Task<object> LogTransactionAsync(UserTransactionLogModel log)
        {
            IDbConnection connection = null;
            try
            {
                string insertTable = log.DbLog switch
                {
                    1 => "UserTransactionLog",
                    2 => "SalesTransactionLog",
                    3 => "PurchaseTransactionLog",
                    4 => "ClaimTransactionLog",
                    _ => "UserTransactionLog"
                };

                // Choose the database connection
                connection = log.DbLog switch
                {
                    1 => _masterDb,
                    2 => _salesDb,
                    3 => _purchaseDb,
                    4 => _claimDb,
                    _ => _masterDb
                };
                string insertQuery = $@"
                    INSERT INTO {insertTable}
                    (TransactionId, ModuleId, ScreenId, ModuleName, ScreenName, OrgId, BranchId,
                     UserId, RoleId, UserName, RoleName, ActionType, ActionDescription, TableName,
                     OldValue, NewValue, IPAddress, MachineName, BrowserInfo, CreatedBy,
                     CreatedDate, ModifiedBy, ModifiedDate, IsActive)
                    VALUES
                    (@TransactionId, @ModuleId, @ScreenId, @ModuleName, @ScreenName, @OrgId, @BranchId,
                     @UserId, @RoleId, @UserName, @RoleName, @ActionType, @ActionDescription, @TableName,
                     @OldValue, @NewValue, @IPAddress, @MachineName, @BrowserInfo, @CreatedBy,
                     @CreatedDate, @ModifiedBy, @ModifiedDate, @IsActive);
                ";

                // Auto-fill system values
                log.CreatedDate = DateTime.UtcNow;
                log.ModifiedDate = DateTime.UtcNow;
                log.MachineName = Environment.MachineName;
                log.IsActive = 1;

                await connection.ExecuteAsync(insertQuery, log);


                return new { Status = true, Message = "Transaction logged successfully" };
            }
            catch (Exception ex)
            {
                return new { Status = false, Message = ex.Message };
            }
            finally
            {
                //if (connection != null)
                //{
                //    try
                //    {
                //        if (connection.State != ConnectionState.Closed)
                //            connection.Close();
                //    }
                //    catch {
                //        throw new Exception("Error");
                //    }

                //    connection.Dispose();
                //    connection.Open();
                //}
            }
        }
    }
}
