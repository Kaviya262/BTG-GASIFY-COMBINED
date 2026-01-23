using System;
using System.Collections.Generic;
using System.Data;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BackEnd.Invoices;
using Core.Models;
using Dapper;
using MediatR;
using UserPanel.Infrastructure.Data;
using Core.Master.Country;
using Microsoft.Extensions.Configuration;
using MySql.Data.MySqlClient;
using BackEnd.Country;
using Application.Master.CountryItem.UpdateCountryItem;
using Application.Master.CountryItem.CreateCountryItem;
using Application.Master.CountryItem.GetCountryItemById;
using Application.Master.CountryItem.GetAllCountryItem;
using System.Globalization;
using Core.Abstractions;

namespace Infrastructure.Repositories
{
    public class CountryRepository : ICountryRepository
    { //mysql queries
        private readonly IDbConnection _connection;

        public CountryRepository(IUnitOfWorkDB1 unitOfWork)
        {
            _connection = unitOfWork.Connection;
        }
        #region GetAllCountriesAsync
        public async Task<object> GetAllCountriesAsync(int opt, int Id, string countryCode = "", string countryName = "")
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("Opt", opt); //1
                param.Add("ConId", Id); // 0
                param.Add("conCode", string.IsNullOrEmpty(countryCode) ? null : countryCode);
                param.Add("conName", string.IsNullOrEmpty(countryName) ? null : countryName);

                var List = await _connection.QueryAsync<object>(Country.CountryProcedure,
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
        #region GetCountryByIdAsync
        public async Task<object> GetCountryByIdAsync(int opt, int countryId, string contCode, string contName)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("Opt", opt); // get by id 2
                param.Add("ConId", countryId);
                param.Add("conCode", contCode); //null
                param.Add("conName", contName); //null

                var data = await _connection.QueryFirstOrDefaultAsync<object>(Country.CountryProcedure,
                    param: param, commandType: CommandType.StoredProcedure);

                if (data == null)
                {
                    return new ResponseModel()
                    {
                        Data = null,
                        Message = "Country Id not found!",
                        Status = false
                    };
                }

                return new ResponseModel()
                {
                    Data = data,
                    Message = "Country found!",
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
        #region GetCountryByCodeAsync 
        public async Task<object> GetCountryByCodeAsync(int opt, int Id, string contCode, string contName)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("Opt", opt); //get by code 3
                param.Add("ConId", Id); //0
                param.Add("conCode", contCode);
                param.Add("conName", contName);
                var data = await _connection.QueryAsync<object>(Country.CountryProcedure,
                    param: param, commandType: CommandType.StoredProcedure);
                if (data == null)
                {
                    return new ResponseModel()
                    {
                        Data = null,
                        Message = "Not Found!",
                        Status = false
                    };
                }
                else
                {
                    return new ResponseModel
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
                    Message = "Something went wrong :" + ex.Message,
                    Status = false
                };

            }
        }
        #endregion
        #region GetCountryByNameAsync
        public async Task<object> GetCountryByNameAsync(int opt, int Id, string contCode, string contName)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("Opt", opt); // get by name 4
                param.Add("ConId", Id); //0
                param.Add("conCode", contCode);
                param.Add("conName", contName);
                var data = await _connection.QueryAsync<object>(Country.CountryProcedure,
                param: param, commandType: CommandType.StoredProcedure);
                if (data == null)
                {
                    return new ResponseModel()
                    {
                        Data = null,
                        Message = "Not Found!",
                        Status = false
                    };
                }
                else
                {
                    return new ResponseModel()
                    {
                        Data = data,
                        Message = "Names Listed!",
                        Status = false
                    };
                }
            }
            catch (Exception ex)
            {
                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went Wrong : " + ex.Message,
                    Status = false
                };
            }

        }
        #endregion
        #region CreateCountryAsync
        public async Task<object> CreateCountryAsync(CountryItemMain obj)
        {
            try
            {
                var query = @"INSERT INTO master_country (CountryCode, CountryName, IsActive, CreatedBy, 
                                          CreaetedIP, CreatedDate) 
                                          VALUES (@CountryCode, @CountryName, @IsActive, @UserId,
                                          '', Now());
                                            SELECT LAST_INSERT_ID();";

                var result = await _connection.ExecuteScalarAsync<int>(query, obj.Header);
                if (result > 0)
                    return new ResponseModel()
                    {
                        Data = result,
                        Message = "Country created successfully",
                        Status = true
                    };
                else
                    return new ResponseModel()
                    {
                        Data = null,
                        Message = "Failed to create country",
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
        #region UpdateCountryAsync
        public async Task<object> UpdateCountryAsync(CountryItemMain Obj)
        {
            try
            {

                var query = @"
                    UPDATE master_country 
                    SET 
                        CountryCode = @CountryCode,
                        CountryName = @CountryName,
                        IsActive = @IsActive,  
                        ModifiedBy = @UserId,
                        ModifiedIP = '',
                        ModifiedDate = Now()
                    WHERE CountryId = @countryId";
                var rowsAffected = await _connection.ExecuteAsync(query, new
                {
                    CountryCode = Obj.Header.CountryCode,
                    CountryName = Obj.Header.CountryName,
                    IsActive = Obj.Header.IsActive,
                    UserId = Obj.Header.UserId,
                    CountryId = Obj.Header.CountryId
                });

                if (rowsAffected > 0)
                {
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
