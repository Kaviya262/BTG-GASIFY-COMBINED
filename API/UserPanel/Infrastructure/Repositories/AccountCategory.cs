using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dapper;
using Core.Abstractions;
using BackEnd.Finance.Accounts;
using BackEnd.Finance.Accounts.Models;

namespace Infrastructure.Finance.Accounts
{
    public class AccountCategoryRepository : IAccountCategoryRepository
    {
        private readonly IUnitOfWorkDB3 _unitOfWorkDB3;

        public AccountCategoryRepository(IUnitOfWorkDB3 unitOfWorkDB3)
        {
            _unitOfWorkDB3 = unitOfWorkDB3 ?? throw new ArgumentNullException(nameof(unitOfWorkDB3));
        }

        public async Task<IEnumerable<AccountCategory>> GetAll()
        {
            var result = await _unitOfWorkDB3.Connection.QueryAsync<AccountCategory>(
                AccountCategoryDB.AccountCategory,
                new
                {
                    p_ActionType = "GETALL",
                    p_Id = 0,  
                    p_CategoryCode = (int?)null,
                    p_CategoryName = (string)null,
                    p_CategoryId = (int?)null,
                    p_Description = (string)null,
                    p_CreatedBy = (int?)null,
                    p_CreatedDate = (DateTime?)null,
                    p_CreatedIP = (string)null,
                    p_LastModifiedBy = (int?)null,
                    p_LastModifiedDate = (DateTime?)null,
                    p_LastModifiedIP = (string)null,
                    p_IsActive = (bool?)null,
                    p_OrgId = (int?)null,
                    p_BranchId = (int?)null
                },
                commandType: System.Data.CommandType.StoredProcedure,
                transaction: _unitOfWorkDB3.Transaction
            );

            return result;
        }

        // Insert new account category
        public async Task<AccountCategory> Insert(AccountCategory category)
        {
            category.CreatedDate = DateTime.Now;
            category.LastModifiedDate = DateTime.Now;

            category.Id = await _unitOfWorkDB3.Connection.ExecuteScalarAsync<int>(
                AccountCategoryDB.AccountCategory,
                new
                {
                    p_ActionType = "INSERT",
                    p_Id = category.Id,
                    p_CategoryCode = category.CategoryCode,
                    p_CategoryName = category.CategoryName,
                    p_CategoryId = category.CategoryId,
                    p_Description = category.Description,
                    p_CreatedBy = category.CreatedBy,
                    p_CreatedDate = category.CreatedDate,
                    p_CreatedIP = category.CreatedIP,
                    p_LastModifiedBy = category.LastModifiedBy,
                    p_LastModifiedDate = category.LastModifiedDate,
                    p_LastModifiedIP = category.LastModifiedIP,
                    p_IsActive = category.IsActive,
                    p_OrgId = category.OrgId,
                    p_BranchId = category.BranchId
                },
                commandType: System.Data.CommandType.StoredProcedure,
                transaction: _unitOfWorkDB3.Transaction
            );

            return category;
        }
        
        public async Task Update(AccountCategory category)
        {
            await _unitOfWorkDB3.Connection.ExecuteAsync(
                AccountCategoryDB.AccountCategory,
                new
                {
                    p_ActionType = "UPDATE",
                    p_Id = category.Id,
                    p_CategoryCode = category.CategoryCode,
                    p_CategoryName = category.CategoryName,
                    p_CategoryId = category.CategoryId,
                    p_Description = category.Description,
                    p_CreatedBy = category.CreatedBy,
                    p_CreatedDate = category.CreatedDate,
                    p_CreatedIP = category.CreatedIP,
                    p_LastModifiedBy = category.LastModifiedBy,
                    p_LastModifiedDate = category.LastModifiedDate,
                    p_LastModifiedIP = category.LastModifiedIP,
                    p_IsActive = category.IsActive,
                    p_OrgId = category.OrgId,
                    p_BranchId = category.BranchId
                },
                commandType: System.Data.CommandType.StoredProcedure,
                transaction: _unitOfWorkDB3.Transaction
            );
        }

        public async Task Delete(int id)
        {
            await _unitOfWorkDB3.Connection.ExecuteAsync(
                AccountCategoryDB.AccountCategory,
                new
                {
                    p_ActionType = "DELETE",
                    p_Id = id,
                    p_CategoryCode = (string?)null,
                    p_CategoryName = (string?)null,
                    p_CategoryId = (int?)null,
                    p_Description = (string?)null,
                    p_CreatedBy = (int?)null,
                    p_CreatedDate = (DateTime?)null,
                    p_CreatedIP = (string?)null,
                    p_LastModifiedBy = (int?)null,
                    p_LastModifiedDate = (DateTime?)null,
                    p_LastModifiedIP = (string?)null,
                    p_IsActive = (bool?)null,
                    p_OrgId = (int?)null,
                    p_BranchId = (int?)null
                },
                commandType: System.Data.CommandType.StoredProcedure,
                transaction: _unitOfWorkDB3.Transaction
            );
        }

    }
}
