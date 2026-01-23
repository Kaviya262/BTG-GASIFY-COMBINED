using BackEnd.AccountCategories;
using BackEnd.Finance.Accounts;
using BackEnd.Master;
using Core.Abstractions;
using Core.AccountsCategories.GLcodemaster;
using Core.Models;
using Dapper;
using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class GLCodeMasterRepository : IGLCodeMasterRepository
    {
        private readonly IUnitOfWorkDB3 _unitOfWork;

        public GLCodeMasterRepository(IUnitOfWorkDB3 unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // GET all
        public async Task<IEnumerable<GLCodeMaster>> GetAllAsync()
        {
            var parameters = BuildParameters(new GLCodeMaster(), "GET", 0);

            return await _unitOfWork.Connection.QueryAsync<GLCodeMaster>(
                GLCodeMasterDB.GLCodeMaster,
                parameters,
                commandType: CommandType.StoredProcedure,
                transaction: _unitOfWork.Transaction);
        }

        // CREATE
        public async Task<GLCodeMaster> CreateAsync(GLCodeMaster entity)
        {
            var parameters = BuildParameters(entity, "POST", entity.Id);

            await _unitOfWork.Connection.ExecuteAsync(
                GLCodeMasterDB.GLCodeMaster,
                parameters,
                commandType: CommandType.StoredProcedure,
                transaction: _unitOfWork.Transaction);

            return entity;
        }

        // UPDATE
        public async Task<GLCodeMaster> UpdateAsync(GLCodeMaster entity)
        {
            var parameters = BuildParameters(entity, "UPDATE", entity.Id);

            await _unitOfWork.Connection.ExecuteAsync(
                GLCodeMasterDB.GLCodeMaster,
                parameters,
                commandType: CommandType.StoredProcedure,
                transaction: _unitOfWork.Transaction);

            return entity;
        }

        // DELETE
        public async Task DeleteAsync(int id)
        {
            var parameters = BuildParameters(new GLCodeMaster(), "DELETE", id);

            await _unitOfWork.Connection.ExecuteAsync(
                GLCodeMasterDB.GLCodeMaster,
                parameters,
                commandType: CommandType.StoredProcedure,
                transaction: _unitOfWork.Transaction);
        }

        // Optional: Generate GLSequenceId if needed
        public async Task<string> GenerateGLSequenceIdAsync(int categoryId, int inputId)
        {
            var result = await _unitOfWork.Connection.QuerySingleOrDefaultAsync<string>(
                GLcodegeneration.GenerateGLSequence,
                new
                {
                    p_CategoryId = categoryId,
                    p_InputId = inputId
                },
                commandType: CommandType.StoredProcedure
            );

            if (string.IsNullOrEmpty(result))
                throw new Exception("No GL sequence could be generated.");

            return result;
        }

        public async Task<IEnumerable<AccountTypeDetailsDto>> GetAllAccountTypeDetailsAsync()
        {
            return await _unitOfWork.Connection.QueryAsync<AccountTypeDetailsDto>(
                GetAllGlCodeMasterproc.GetAllGlcodeMasterProc,
                commandType: CommandType.StoredProcedure,
                transaction: _unitOfWork.Transaction
            );
        }

        public async Task<AccountTypeDetailsDto> GetAccountTypeDetailsByIdAsync(int glId)
        {
            var parameters = new DynamicParameters();
            parameters.Add("p_GLId", glId, DbType.Int32);

            return await _unitOfWork.Connection.QueryFirstOrDefaultAsync<AccountTypeDetailsDto>(
                GetAccountTypeDetailsByGLId.GetAccountTypeDetailsByIdProc,
                parameters,
                commandType: CommandType.StoredProcedure,
                transaction: _unitOfWork.Transaction
            );
        }


        // Build parameters for SP
        private DynamicParameters BuildParameters(GLCodeMaster entity, string action, int id)
        {
            var parameters = new DynamicParameters();
            parameters.Add("p_Action", action);
            parameters.Add("p_Id", id);

            // Correct: GLSequenceId comes from the entity as string
            parameters.Add("p_GLcode", entity.Glcode);

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
            parameters.Add("p_AccountTypeId", entity.AccountTypeId);

            return parameters;
        }
    }
}
