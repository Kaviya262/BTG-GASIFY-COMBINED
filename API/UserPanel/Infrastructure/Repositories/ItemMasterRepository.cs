using BackEnd.Master;
using Core.Abstractions;
using Core.Master.Item;
using Core.Master.Supplier;
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
    public class ItemMasterRepository : IItemMasterRepository
    {
        private readonly IDbConnection _connection;

        public ItemMasterRepository(IUnitOfWorkDB4 unitOfWork)
        {
            _connection = unitOfWork.Connection;
        }
        public async Task<object> GetAllAsync(int branchid, int orgid, int itemid, string itemcode, string itemname, int groupid, int categoryid)
        {
            try
            {
                var parameters = new DynamicParameters();
                parameters.Add("opt", 1);
                parameters.Add("branchid", branchid);
                parameters.Add("orgid", orgid);
                parameters.Add("itemid", itemid);
                parameters.Add("itemcode", itemcode);
                parameters.Add("itemname", itemname);
                parameters.Add("groupid", groupid);
                parameters.Add("categoryid", categoryid);

                var result = await _connection.QueryAsync<dynamic>(MasterItemMaster.MasterItemProcedure, parameters, commandType: CommandType.StoredProcedure);

                return new ResponseModel
                {
                    Status = true,
                    Data = result
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Status = false,
                    Message = $"Error: {ex.Message}"
                };
            }
        }

        public async Task<object> AddAsync(ItemMaster Obj)
        {
            try
            {

                string Message = "";
               

                const string headerSql = @"
                      INSERT INTO master_item
                        (itemid,itemcode,itemname,description,categoryid,groupid,UOMID,locationid,IsActive,CreatedBy,CreatedIP,CreatedDate,orgid,branchid,TaxPerc,unitprice,VAT,sellingitemname)
                        VALUES
                        (@itemid,@itemcode,@itemname,@description,@categoryid,@groupid,@UOMID,@locationid,1,@userid,@CreatedIP,NOW(),@orgid,@branchid,@TaxPerc,@unitprice,@VAT,
                        @sellingitemname);
                ";

                await _connection.ExecuteAsync(headerSql, Obj.Master);
               


                return new ResponseModel()
                {
                    Message = "Saved Successfully" + Message,
                    Status = true
                };

            }
            catch (Exception Ex)
            {
                return new ResponseModel()
                {
                    Message = $"Error: {Ex.Message}",
                    Status = false
                };
            }
        }

        public async Task<object> UpdateAsync(ItemMaster Obj)
        {
            try
            {

                const string headerSql = @"
                        UPDATE master_item
                        SET
                        itemid = @itemid,
                        itemcode = @itemcode,
                        itemname = @itemname,
                        description = @description,
                        categoryid = @categoryid,
                        groupid = @groupid,
                        UOMID = @UOMID,
                        locationid = @locationid,
                        
                        LastModifiedIP = @LastModifiedIP,
                        LastModifiedBy = @userid,
                        LastModifiedDate = NOW(),
                        orgid = @orgid,
                        branchid = @branchid,
                        TaxPerc = @TaxPerc,
                        unitprice = @unitprice,
                        VAT = @VAT,
                        sellingitemname = @sellingitemname
                        WHERE itemid = @itemid";


                await _connection.ExecuteAsync(headerSql, Obj.Master);

               


                return new ResponseModel
                {
                    Data = null,
                    Message = "Item master updated successfully",
                    Status = true
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Data = null,
                    Message = "Something went wrong: " + ex.Message,
                    Status = false
                };
            }

        }


        public async Task<object> GetItemCategoryList(int branchid, int orgid)
        {
            try
            {
                var parameters = new DynamicParameters();
                parameters.Add("opt", 2);
                parameters.Add("branchid", branchid);
                parameters.Add("orgid", orgid);
                parameters.Add("itemid", 0);
                parameters.Add("itemcode", null, DbType.String);
                parameters.Add("itemname", null, DbType.String);
                parameters.Add("groupid", 0);
                parameters.Add("categoryid", 0);

                var result = await _connection.QueryAsync<dynamic>(MasterItemMaster.MasterItemProcedure, parameters, commandType: CommandType.StoredProcedure);

                return new ResponseModel
                {
                    Status = true,
                    Data = result
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Status = false,
                    Message = $"Error: {ex.Message}"
                };
            }
        }

        public async Task<object> GetItemGroupList(int branchid, int orgid)
        {
            try
            {
                var parameters = new DynamicParameters();
                parameters.Add("opt", 3);
                parameters.Add("branchid", branchid);
                parameters.Add("orgid", orgid);
                parameters.Add("itemid", 0);
                parameters.Add("itemcode", null, DbType.String);
                parameters.Add("itemname", null, DbType.String);
                parameters.Add("groupid", 0);
                parameters.Add("categoryid", 0);

                var result = await _connection.QueryAsync<dynamic>(MasterItemMaster.MasterItemProcedure, parameters, commandType: CommandType.StoredProcedure);

                return new ResponseModel
                {
                    Status = true,
                    Data = result
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Status = false,
                    Message = $"Error: {ex.Message}"
                };
            }
        }

        public async Task<object> GetUOMList(int branchid, int orgid)
        {
            try
            {
                var parameters = new DynamicParameters();
                parameters.Add("opt", 4);
                parameters.Add("branchid", branchid);
                parameters.Add("orgid", orgid);
                parameters.Add("itemid", 0);
                parameters.Add("itemcode", null, DbType.String);
                parameters.Add("itemname", null, DbType.String);
                parameters.Add("groupid", 0);
                parameters.Add("categoryid", 0);

                var result = await _connection.QueryAsync<dynamic>(MasterItemMaster.MasterItemProcedure, parameters, commandType: CommandType.StoredProcedure);

                return new ResponseModel
                {
                    Status = true,
                    Data = result
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Status = false,
                    Message = $"Error: {ex.Message}"
                };
            }
        }

        public async Task<object> GetItemCodeList(int branchid, int orgid)
        {
            try
            {
                var parameters = new DynamicParameters();
                parameters.Add("opt", 5);
                parameters.Add("branchid", branchid);
                parameters.Add("orgid", orgid);
                parameters.Add("itemid", 0);
                parameters.Add("itemcode", null, DbType.String);
                parameters.Add("itemname", null, DbType.String);
                parameters.Add("groupid", 0);
                parameters.Add("categoryid", 0);

                var result = await _connection.QueryAsync<dynamic>(MasterItemMaster.MasterItemProcedure, parameters, commandType: CommandType.StoredProcedure);

                return new ResponseModel
                {
                    Status = true,
                    Data = result
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Status = false,
                    Message = $"Error: {ex.Message}"
                };
            }
        }

        public async Task<object> GetItemNameList(int branchid, int orgid)
        {
            try
            {
                var parameters = new DynamicParameters();
                parameters.Add("opt", 6);
                parameters.Add("branchid", branchid);
                parameters.Add("orgid", orgid);
                parameters.Add("itemid", 0);
                parameters.Add("itemcode", null, DbType.String);
                parameters.Add("itemname", null, DbType.String);
                parameters.Add("groupid", 0);
                parameters.Add("categoryid", 0);

                var result = await _connection.QueryAsync<dynamic>(MasterItemMaster.MasterItemProcedure, parameters, commandType: CommandType.StoredProcedure);

                return new ResponseModel
                {
                    Status = true,
                    Data = result
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Status = false,
                    Message = $"Error: {ex.Message}"
                };
            }
        }


        public async Task<object> UpdateItemStatus(int branchid,int orgid,int itemid,bool isactive,int userid)
        {
            try
            {

                const string headerSql = @"
                        UPDATE master_item
                        SET                      
                        IsActive = @isactive,
                        LastModifiedIP = '',
                        LastModifiedBy = @userid,
                        LastModifiedDate = NOW()                                       
                        WHERE itemid = @itemid";

                var parameters = new
                {
                    isactive,                    
                    userid,
                    itemid,
                    orgid,
                    branchid
                };
                await _connection.ExecuteAsync(headerSql, parameters);


                return new ResponseModel
                {
                    Data = null,
                    Message = "Item master status updated successfully",
                    Status = true
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Data = null,
                    Message = "Something went wrong: " + ex.Message,
                    Status = false
                };
            }

        }
        public async Task<object> UpdateActiveateAsync(int itemid, bool isactive)
        {
            try
            {
                const string headerSql = @"
                UPDATE master_item
                SET
                IsActive = @isactive
                WHERE itemid = @itemid";

                var parameters = new
                {
                    isactive,
                    itemid
                };
                await _connection.ExecuteAsync(headerSql, parameters);

                return new ResponseModel
                {
                    Data = null,
                    Message = "Item master updated successfully",
                    Status = true
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Data = null,
                    Message = "Something went wrong: " + ex.Message,
                    Status = false
                };
            }
        }

        public async Task<object> GetItemcodeSeqId(int branchid, int orgid)
        {
            try
            {
                var parameters = new DynamicParameters();
                parameters.Add("opt", 7);
                parameters.Add("branchid", branchid);
                parameters.Add("orgid", orgid);
                parameters.Add("itemid", 0);
                parameters.Add("itemcode", null, DbType.String);
                parameters.Add("itemname", null, DbType.String);
                parameters.Add("groupid", 0);
                parameters.Add("categoryid", 0);

                var result = await _connection.QueryAsync<dynamic>(MasterItemMaster.MasterItemProcedure, parameters, commandType: CommandType.StoredProcedure);

                return new ResponseModel
                {
                    Status = true,
                    Data = result
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Status = false,
                    Message = $"Error: {ex.Message}"
                };
            }
        }

    }
}
