using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BackEnd.Currency;
using Core.Abstractions;
using Core.Master.Currency;
using Core.Models;
using Dapper;
using DocumentFormat.OpenXml.Wordprocessing;
using MySql.Data.MySqlClient;
using Mysqlx.Crud;
using UserPanel.Infrastructure.Data;
using static Core.Master.Currency.CurrencyItem;

namespace Infrastructure.Repositories
{
    public class CurrencyRepository : ICurrencyRepository
    {
        private readonly IDbConnection _connection;

        public CurrencyRepository(IUnitOfWorkDB1 unitOfWork)
        {
            _connection = unitOfWork.Connection;
        }
        #region GetAllCurrenciesAsync
        public async Task<object> GetAllCurrenciesAsync(int opt, int Id, string currencyCode, string currencyName)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("Opt", opt);    //1                    
                param.Add("P_CurrencyId", Id); //null                
                param.Add("Cur_Code", string.IsNullOrEmpty(currencyCode) ? "" : currencyCode);
                param.Add("Cur_Name", string.IsNullOrEmpty(currencyName) ? "" : currencyName);

                var List = await _connection.QueryAsync<object>(Currency.CurrencyProcedure,
                    param: param, commandType: CommandType.StoredProcedure);
                var modelList = List.ToList();

                return new ResponseModel()
                {
                    Data = modelList,
                    Message = "Success",
                    Status = true
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel()
                {
                    Data = null,
                    Message = ex.Message,
                    Status = false
                };
            }
        }
        #endregion
        #region GetCurrencyByIdAsync
        public async Task<object> GetCurrencyByIdAsync(int opt, int currencyId, string curCode, string curName)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("Opt", 2); //2
                param.Add("P_CurrencyId", currencyId);
                param.Add("Cur_Code", curCode); //""
                param.Add("Cur_Name", curName);//""

                var data = await _connection.QueryFirstOrDefaultAsync<object>(Currency.CurrencyProcedure,
                    param: param, commandType: CommandType.StoredProcedure);

                if (data == null)
                {
                    return new ResponseModel()
                    {
                        Data = null,
                        Message = "Currency Id not found!",
                        Status = false
                    };
                }

                return new ResponseModel()
                {
                    Data = data,
                    Message = "Currency found!",
                    Status = true
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went wrong:" + ex.Message,
                    Status = false
                };
            }
        }
        #endregion
        #region GetCurrencyByCodeAsync
        public async Task<object> GetCurrencyByCodeAsync(int opt, int Id, string curCode, string curName)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("Opt", opt);//get by code 3
                param.Add("P_CurrencyId", Id); //0
                param.Add("Cur_Code", curCode);
                param.Add("Cur_Name", curName); //null

                var data = await _connection.QueryAsync<object>(Currency.CurrencyProcedure, param: param,
                    commandType: CommandType.StoredProcedure);
                if (data == null)
                {
                    return new ResponseModel()
                    {
                        Data = null,
                        Message = "No Code Found!",
                        Status = false
                    };
                }
                else
                {
                    return new ResponseModel()
                    {
                        Data = data,
                        Message = "Listed Codes!",
                        Status = true
                    };
                }
            }
            catch (Exception ex)
            {
                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went Wrong :" + ex.Message,
                    Status = false
                };
            }
        }
        #endregion
        #region GetCurrencyByNameAsync
        public async Task<object> GetCurrencyByNameAsync(int opt, int Id, string curCode, string curName)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("Opt", opt);//get by name 4
                param.Add("P_CurrencyId", Id); //0
                param.Add("Cur_Code", curCode); //null
                param.Add("Cur_Name", curName);

                var data = await _connection.QueryAsync<object>(Currency.CurrencyProcedure, param: param,
                    commandType: CommandType.StoredProcedure);

                if (data == null)
                {
                    return new ResponseModel()
                    {
                        Data = null,
                        Message = "No Names Found!",
                        Status = false
                    };
                }
                return new ResponseModel()
                {
                    Data = data,
                    Message = "Listed Names!",
                    Status = true
                };

            }
            catch (Exception ex)
            {
                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went Wrong :" + ex.Message,
                    Status = false
                };
            }

        }
        #endregion
        #region CreateCurrencyAsync
        public async Task<object> CreateCurrencyAsync(CurrencyItemMain obj)
        {
            try
            {
                var query = @"
                              INSERT INTO master_currency(
                                    CurrencyCode, CurrencyName, CurrencySymbol, ExchangeRate,
                                    EffectiveFromdate, CreatedBy, CreatedDate,
                                    CreatedIP,IsActive, OrgId, BranchId, IsBaseCurrency)
                                    VALUES(
                                    @CurrencyCode, @CurrencyName, @CurrencySymbol, @ExchangeRate, 
                                    @EffectiveFromdate, @UserId, NOW(), '',                                    
                                    1, @OrgId, @BranchId, 0
                                    );
                                    SELECT LAST_INSERT_ID(); ";
                var result = await _connection.ExecuteScalarAsync<int>(query, obj.Header);

                if (result > 0)
                    return new ResponseModel()
                    {
                        Data = new { CurrencyId = result },
                        Message = "Currency created successfully",
                        Status = true
                    };
                else
                    return new ResponseModel()
                    {
                        Data = null,
                        Message = "Failed to Create Currency",
                        Status = false
                    };

            }
            catch (Exception ex)
            {
                return new ResponseModel()
                {
                    Data = null,
                    Message = ex.Message,
                    Status = false
                };
            }
        }

        #endregion
        #region UpdateCurrencyStatusAsync
        public async Task<object> UpdateCurrencyStatusAsync(CurrencyItemMain obj)
        {
            try
            {
                var Updatequery = @"
                    UPDATE master_currency
                    SET                         
                        LastModifiedBy = @UserId,
                        LastModifiedDate = Now(),
                        LastModifiedIP = '',
                        IsActive = @IsActive                                               
                        WHERE CurrencyId = @CurrencyId";
                

                var rowsAffected = await _connection.ExecuteAsync(Updatequery, obj.Detail);
                if (rowsAffected > 0)
                {
                    return new ResponseModel()
                    {
                        Data = rowsAffected,
                        Message = "Status Updated Successfully!!",
                        Status = true
                    };

                }
                else
                {
                    return new ResponseModel()
                    {
                        Data = null,
                        Message = "Status Update Failed!",
                        Status = false
                    };
                }

            }
            catch (Exception ex)
            {
                return new ResponseModel()
                {
                    Data = null,
                    Message = ex.Message,
                    Status = false
                };
            }

        }
        #endregion

        #region UpdateCurrencyAsync
        public async Task<object> UpdateCurrencyAsync(CurrencyItemMain obj)
        {
            try
            {
                var selectQuery = "SELECT CurrencyCode, CurrencyName, CurrencySymbol, ExchangeRate, " +
                    "EffectiveFromdate FROM master_currency WHERE CurrencyId = @CurrencyId";
                var existCurr = await _connection.QueryFirstOrDefaultAsync<CurrencyItemHeader>
                    (selectQuery, new { CurrencyId = obj.Header.CurrencyId });

                if (existCurr == null)
                {
                    return new ResponseModel()
                    {
                        Data = null,
                        Message = "Currency not found",
                        Status = false
                    };
                }
                var Updatequery = @"
                    UPDATE master_currency
                    SET 
                        CurrencyCode = @CurrencyCode,
                        CurrencyName = @CurrencyName,
                        CurrencySymbol = @CurrencySymbol,
                        ExchangeRate = @ExchangeRate,
                        EffectiveFromdate = @EffectiveFromdate,
                        LastModifiedBy = @UserId,
                        LastModifiedDate = Now(),                   
                        IsActive = @IsActive,
                        OrgId = @OrgId,
                        BranchId = @BranchId,
                        IsBaseCurrency = @IsBaseCurrency                        
                        WHERE CurrencyId = @CurrencyId";
                var rowsAffected = await _connection.ExecuteAsync(Updatequery, obj.Header);

                if (rowsAffected > 0)
                {
                    var insertQuery = @"
                INSERT INTO master_currencyLOG (
                    CurrencyId,
                    Prev_CurrencyCode,
                    New_CurrencyCode,
                    Prev_CurrencyName,
                    New_CurrencyName,
                    Prev_CurrencySymbol,
                    New_CurrencySymbol,
                    Prev_ExchangeRate,
                    New_ExchangeRate,
                    Prev_EffectiveFromdate,
                    New_EffectiveFromdate,
                    LastModifiedBy,
                    LastModifiedDate,
                    LastModifiedIP
                )
                VALUES(    
                    @CurrencyId,
                    @Prev_CurrencyCode,
                    @CurrencyCode,
                    @Prev_CurrencyName,
                    @CurrencyName,
                    @Prev_CurrencySymbol,
                    @CurrencySymbol,
                    @Prev_ExchangeRate,
                    @ExchangeRate,
                    @Prev_EffectiveFromdate,
                    @EffectiveFromdate,
                    @UserId,
                    Now(),
                    NULL                
                     )";

                    await _connection.ExecuteAsync(insertQuery, new
                    {
                        CurrencyId = obj.Header.CurrencyId,
                        Prev_CurrencyCode = existCurr.CurrencyCode,
                        CurrencyCode = obj.Header.CurrencyCode,
                        Prev_CurrencyName = existCurr.CurrencyName,
                        CurrencyName = obj.Header.CurrencyName,
                        Prev_CurrencySymbol = existCurr.CurrencySymbol,
                        CurrencySymbol = obj.Header.CurrencySymbol,
                        Prev_ExchangeRate = existCurr.ExchangeRate,
                        ExchangeRate = obj.Header.ExchangeRate,
                        Prev_EffectiveFromdate = existCurr.EffectiveFromdate,
                        EffectiveFromdate = obj.Header.EffectiveFromdate,
                        UserId = obj.Header.UserId
                    });

                    return new ResponseModel()
                    {
                        Data = rowsAffected,
                        Message = "Updated Successfully!!",
                        Status = true
                    };
                }
                else
                {
                    return new ResponseModel()
                    {
                        Data = null,
                        Message = "Update Failed!",
                        Status = false
                    };
                }

            }
            catch (Exception ex)
            {
                return new ResponseModel()
                {
                    Data = null,
                    Message = ex.Message,
                    Status = false
                };
            }
        }
        #endregion


    }
}

