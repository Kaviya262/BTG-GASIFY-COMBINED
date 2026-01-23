using BackEnd.Finance.Accounts.Interfaces;
using BackEnd.Finance.Accounts.Models;
using Core.Abstractions;
using Dapper;
using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;

namespace BackEnd.Finance.Accounts.Repositories
{
    public class AccountTypeRepository : IAccountTypeRepository
    {
        private readonly IUnitOfWorkDB3 _unitOfWorkDB3; 

        public AccountTypeRepository(IUnitOfWorkDB3 unitOfWorkDB3)
        {
            _unitOfWorkDB3 = unitOfWorkDB3 ?? throw new ArgumentNullException(nameof(unitOfWorkDB3));
        }

        public async Task<IEnumerable<AccountType>> GetAllAsync()
        {
            var parameters = BuildParameters(new AccountType(), "GET", 0);

            return await _unitOfWorkDB3.Connection.QueryAsync<AccountType>(
                AccountTypeDB.AccountType,
                parameters,
                commandType: CommandType.StoredProcedure,
                transaction: _unitOfWorkDB3.Transaction);
        }

        public async Task<AccountType> InsertAsync(AccountType accountType)
        {
            accountType.CreatedDate = DateTime.Now;
            accountType.LastModifiedDate = DateTime.Now;

            var parameters = BuildParameters(accountType, "POST", accountType.Id);

            await _unitOfWorkDB3.Connection.ExecuteAsync(
                AccountTypeDB.AccountType,
                parameters,
                commandType: CommandType.StoredProcedure,
                transaction: _unitOfWorkDB3.Transaction);

            return accountType;
        }

        public async Task<AccountType> UpdateAsync(AccountType accountType)
        {
            accountType.LastModifiedDate = DateTime.Now;

            var parameters = BuildParameters(accountType, "UPDATE", accountType.Id);

            await _unitOfWorkDB3.Connection.ExecuteAsync(
                AccountTypeDB.AccountType,
                parameters,
                commandType: CommandType.StoredProcedure,
                transaction: _unitOfWorkDB3.Transaction);

            return accountType;
        }

        // Delete account type
        public async Task<int> DeleteAsync(int id)
        {
            var parameters = BuildParameters(new AccountType(), "DELETE", id);

            await _unitOfWorkDB3.Connection.ExecuteAsync(
                AccountTypeDB.AccountType,
                parameters,
                commandType: CommandType.StoredProcedure,
                transaction: _unitOfWorkDB3.Transaction);

            return id;
        }

        // Build parameters for SP
        private DynamicParameters BuildParameters(AccountType entity, string action, int id)
        {
            var parameters = new DynamicParameters();
            parameters.Add("p_Action", action);
            parameters.Add("p_Id", id);
            parameters.Add("p_CategoryCode", entity.CategoryCode);
            parameters.Add("p_CategoryName", entity.CategoryName);
            parameters.Add("p_CategoryId", entity.CategoryId);
            parameters.Add("p_Description", entity.Description);
            parameters.Add("p_CreatedBy", entity.CreatedBy);
            parameters.Add("p_CreatedDate", entity.CreatedDate);
            parameters.Add("p_CreatedIP", entity.CreatedIP);
            parameters.Add("p_LastModifiedBy", entity.LastModifiedBy);
            parameters.Add("p_LastModifiedDate", entity.LastModifiedDate);
            parameters.Add("p_LastModifiedIP", entity.LastModifiedIP);
            parameters.Add("p_IsActive", entity.IsActive);
            parameters.Add("p_OrgId", entity.OrgId);
            parameters.Add("p_BranchId", entity.BranchId);

            return parameters;
        }
    }
}
