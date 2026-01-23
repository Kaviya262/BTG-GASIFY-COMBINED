using System;
using System.Collections.Generic;
using System.Data;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BackEnd.Order.cs;
using BackEnd.Quotation;
using Core.Abstractions;
using Core.Models;
using Core.OrderMng.SaleOrder;
using Dapper;
using Mysqlx.Crud;
using Mysqlx.Resultset;
using Mysqlx.Session;

using UserPanel.Infrastructure.Data;
using Order = BackEnd.Order.cs.Order;




namespace Infrastructure.Repositories
{
    public class SaleOrderRepository : ISaleOrderRepository
    {
        private readonly IDbConnection _connection;
        string IPAddress = "";


        public SaleOrderRepository(IUnitOfWorkDB1 unitOfWork)
        {
            _connection = unitOfWork.Connection;
        }
        public async Task<object> AddAsync(SaleOrderItemmain Obj)
        {
            try
            {
                int IsValidated = 0;
                string Message = "";
                Int32 Result = 0;
                SharedRepository SR = new SharedRepository(_connection);

                var response = await SR.GetSeqNumber(0, Obj.Header.SO_Number, 2, Obj.Header.BranchId, 0);
                if (response.Status == true)
                {
                    if (response.Data.result == 1)
                    {
                        IsValidated = 1;
                        Message = " - The current order number " + Obj.Header.SO_Number + " is taken for another order so the new order number (" + response.Data.text + ") has been generated for this order";
                        Obj.Header.SO_Number = response.Data.text;
                    }
                }


                const string headerSql = @" INSERT INTO tbl_salesorder_header
  (OrderType, SO_Number, OrderBy,  CustomerID, CustomerEmail, CustomerPhone, CreatedIP,
   IsActive,  CreatedBy, CreatedDate,BranchId, RackNumber , ProjectName,IsSubmitted,Categories 
  )
  VALUES(@OrderType, @SO_Number, @OrderBy,  @CustomerID, @CustomerEmail, @CustomerPhone, '', 
  1, @UserId, now(), @BranchId,@RackNumber,@ProjectName,@IsSubmitted,@Categories); ";


                await _connection.ExecuteAsync(headerSql, Obj.Header);

                const string getLastInsertedIdSql = "SELECT LAST_INSERT_ID();";


                var insertedHeaderId = await _connection.QuerySingleAsync<int>(getLastInsertedIdSql);
                var insertedOrderType = Obj.Header.OrderType;

                if (insertedOrderType == 2)
                {
                    foreach (var row in Obj.SQDetail)
                    {
                        row.SO_ID = insertedHeaderId;

                        const string detailsql = @"
    INSERT INTO tbl_so_quotation_detail
    (Sqid, IsActive, SO_ID, createddate, createdip)
    VALUES 
    (@Sqid, 1, @SO_ID, now(), '');";

                        Result = await _connection.ExecuteAsync(detailsql, row);
                    }
                }
                else
                {
                    if (Obj.Header.SQ_ID > 0)
                    {
                        var quotationInsertParams = new
                        {
                            Sqid = Obj.Header.SQ_ID,
                            SO_ID = insertedHeaderId
                        };

                        const string detailsql = @"
INSERT INTO tbl_so_quotation_detail
(Sqid, IsActive, SO_ID, createddate, createdip)
VALUES 
(@Sqid, 1, @SO_ID, now(), '');";

                        Result = await _connection.ExecuteAsync(detailsql, quotationInsertParams);
                    }

                }

                Result = insertedHeaderId;

                foreach (var row in Obj.Details)
                {
                    row.SO_ID = insertedHeaderId;



                    if (insertedOrderType == 1)
                    {

                        //row.Sqdtlid= SQID;
                        const string sqdetailsql = @"
        INSERT INTO tbl_salesorder_details
        (SO_ID, Sqdtlid, PONumber, GasID, GasDescription, Volume, Pressure, SQ_Qty, SO_Qty, Alr_Issued_Qty, 
        Balance_Qty, UoMID, IsActive)
        VALUES 
        (@SO_ID, null, @PONumber, @GasID, @GasDescription, @Volume, @Pressure, @SQ_Qty, @SO_Qty, 
        @Alr_Issued_Qty, @Balance_Qty, @UOMID, 1);";
                        Result = await _connection.ExecuteAsync(sqdetailsql, row);
                    }
                    else
                    {
                        string QuotationQuery = "SELECT * from tbl_so_quotation_detail where SO_ID=" + insertedHeaderId + " and Sqid=" + row.SQID + ";";

                        var SQID = await _connection.QuerySingleAsync<int>(QuotationQuery);
                        row.Sqdtlid = SQID;







                        const string sqdetailsql = @"
        INSERT INTO tbl_salesorder_details
        (SO_ID, Sqdtlid, PONumber, GasID, GasDescription, Volume, Pressure, SQ_Qty, SO_Qty, Alr_Issued_Qty, 
        Balance_Qty, UoMID, IsActive)
        VALUES 
        (@SO_ID, @Sqdtlid, @PONumber, @GasID, @GasDescription, @Volume, @Pressure, @SQ_Qty, @SO_Qty, 
        @Alr_Issued_Qty, @Balance_Qty, @UOMID, 1);";

                        Result = await _connection.ExecuteAsync(sqdetailsql, row);
                    }
                    const string getlastid = "SELECT LAST_INSERT_ID();";
                    var insertedHeaderId2 = await _connection.QuerySingleAsync<int>(getlastid);



                    row.Id = insertedHeaderId2;

                    const string deliveryAddressSql = @"
     INSERT INTO tbl_so_deliveryaddress 
     (SOdtlid, ReqDeliveryDate, Deliveryaddressid, Deliveryaddress, DeliveryInstruction, IsActive)
     VALUES 
     (@Id, @ReqDeliveryDate, @Deliveryaddressid, @Deliveryaddress, @DeliveryInstruction,1);";

                    Result = await _connection.ExecuteAsync(deliveryAddressSql, row);
                }
                int BranchId = Obj.Header.BranchId;
                var UpdateSeq = "update master_documentnumber set Doc_Number=Doc_Number+1 where Doc_Type=2 and unit=" + BranchId;
                Result = await _connection.ExecuteAsync(UpdateSeq, BranchId);
                Result = 1;


                const string updateSalesQuotationSql = "CALL Proc_UpdateSalesQuotation(@SO_ID);";
                await _connection.ExecuteAsync(updateSalesQuotationSql, new { SO_ID = insertedHeaderId });





                /*var param = new DynamicParameters(orderid);
                param.Add("@opt", 0);
                param.Add("@Order_id",orderid);
                param.Add("@orgid", 0);
                param.Add("@branchid", BranchId);

                param.Add("@customerid", 0);
                param.Add("@from_date", "");
                param.Add("@to_date", "");






                var List = await _connection.QueryAsync(Update.Proc_UpdateSalesQuotation, param: param, commandType: CommandType.StoredProcedure);
                var Modellist = List.ToList();
                */




                if (Result == 0)
                {
                    return new ResponseModel()
                    {
                        Data = null,
                        Message = "Saved failed",
                        Status = false
                    };
                }
                else
                {


                    if (Obj.Header.IsSubmitted == 0)
                    {
                        return new ResponseModel()
                        {
                            Data = null,
                            Message = "Saved Successfully" + Message,
                            Status = true
                        };
                    }

                    else
                    {

                        return new ResponseModel()
                        {
                            Data = null,
                            Message = "Posted Successfully" + Message,
                            Status = true
                        };
                    }

                }
            }
            catch (Exception Ex)
            {
                //Logger.Instance.Error("Exception:", Ex);
                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went wrong",
                    Status = false
                };
            }

        }



        public async Task<object> UpdateAsync(SaleOrderItemmain obj)
        {
            try
            {
                Int32 Result = 0;
                const string headerSql = @"
    UPDATE tbl_salesorder_header
    SET
        SO_Number = @SO_Number,
        CustomerID = @CustomerID,
        CustomerEmail = @CustomerEmail,
        CustomerPhone = @CustomerPhone,
        RackNumber = @RackNumber,
        ProjectName = @ProjectName,
        OrderBy=@OrderBy,
        IsSubmitted = @IsSubmitted,
        Categories = @Categories,
LastModifiedDate = now(),
  LastModifiedIP='',
LastModifiedBY=@UserId
         WHERE SO_ID = @SO_ID;
        
        
    ;";


                await _connection.ExecuteAsync(headerSql, obj.Header);

                int HeaderId = obj.Header.SO_ID;



                var UpdateSoquot = "update tbl_so_quotation_detail set isactive=0 where SO_ID =" + HeaderId;
                var updatesoq = "update tbl_so_quotation_detail set isactive = 1 where SO_ID =@SO_ID  and Sqid=@Sqid;";

                const string detailsql = @"
                INSERT INTO tbl_so_quotation_detail
                (SO_ID,Sqid,IsActive,createddate,createdip)
select @SO_ID as SOID,@Sqid as Sqid,1,now(),''
except
select SO_ID,sqid,1,now(),'' from tbl_so_quotation_detail where SO_ID=@SO_ID and Sqid=@Sqid ;";

                Result = await _connection.ExecuteAsync(UpdateSoquot, HeaderId);
                foreach (var row in obj.SQDetail)
                {
                    Result = await _connection.ExecuteAsync(updatesoq, row);
                    Result = await _connection.ExecuteAsync(detailsql, row);

                }



                var UpdateSeq = "update tbl_salesorder_details set isactive=0 where so_id=" + HeaderId;
                Result = await _connection.ExecuteAsync(UpdateSeq, HeaderId);


                const string detailSql = @"
                 UPDATE tbl_salesorder_details
                 SET
            PONumber=@PONumber,
            GasID = @GasID,
            GasDescription = @GasDescription,
            Volume = @Volume,
            Pressure = @Pressure,
            SQ_Qty = @SO_Qty,
            SO_Qty = @SQ_Qty,
            Alr_Issued_Qty = @Alr_Issued_Qty,
            Balance_Qty = @Balance_Qty,
            UoMID = @UOMID,
            isactive=1
           
        WHERE Id = @Id;";










                const string insertDetailSql = @"
         INSERT INTO tbl_salesorder_details
         (SO_ID,Sqdtlid, PONumber, GasID, GasDescription, Volume, Pressure, SQ_Qty, SO_Qty, Alr_Issued_Qty, Balance_Qty, UoMID, IsActive)
         VALUES
         (@SO_ID,@Sqdtlid, @PONumber, @GasID, @GasDescription, @Volume, @Pressure, @SQ_Qty, @SO_Qty, @Alr_Issued_Qty, @Balance_Qty, @UOMID, 1);";


                foreach (var row in obj.Details)
                {
                    var insertedDetailId = 0;
                    if (row.Id > 0)
                    {

                        await _connection.ExecuteAsync(detailSql, row);
                        insertedDetailId = row.Id;


                        const string deliveryAddressSql = @"
                 UPDATE tbl_so_deliveryaddress
                 SET                  
                 ReqDeliveryDate =@ReqDeliveryDate,
                 Deliveryaddressid = @Deliveryaddressid,
                 Deliveryaddress = @Deliveryaddress,
                 DeliveryInstruction = @DeliveryInstruction, 
                 IsActive = 1
                 WHERE SOdtlid = @Id;";

                        await _connection.ExecuteAsync(deliveryAddressSql, row);

                    }
                    else
                    {

                        string QuotationQuery = "SELECT * from tbl_so_quotation_detail where SO_ID=" + HeaderId + " and Sqid=" + row.SQID + ";";

                        var SQID = await _connection.QuerySingleAsync<int>(QuotationQuery);
                        row.Sqdtlid = SQID;

                        row.SO_ID = HeaderId;
                        await _connection.ExecuteAsync(insertDetailSql, row);

                        const string getLastInsertedDetailIdSql = "SELECT LAST_INSERT_ID();";
                        insertedDetailId = await _connection.QuerySingleAsync<int>(getLastInsertedDetailIdSql);





                        row.Id = insertedDetailId;
                        const string deliveryAddressSql = @"
                INSERT INTO tbl_so_deliveryaddress
                (SOdtlid, ReqDeliveryDate, Deliveryaddressid, Deliveryaddress, DeliveryInstruction, IsActive)
                VALUES 
                (@Id, @ReqDeliveryDate, @Deliveryaddressid, @Deliveryaddress, @DeliveryInstruction, 1);";

                        await _connection.ExecuteAsync(deliveryAddressSql, row);
                    }

                }

                const string updateSalesQuotationSql = "CALL Proc_UpdateSalesQuotation(@SO_ID);";
                await _connection.ExecuteAsync(updateSalesQuotationSql, new { SO_ID = HeaderId });












                /* foreach (var row in obj.SQDetail)
                 {

                     const string SQdetailsql = @"
                        UPDATE tbl_so
                        SET
                        Sqid =@Sqid,
                        IsActive= @IsActive;";







                     await _connection.ExecuteAsync(SQdetailsql, row);
                 }*/
















                Result = 1;

                if (Result == 0)
                {
                    return new ResponseModel()
                    {
                        Data = null,
                        Message = "",
                        Status = false
                    };
                }
                else
                {


                    if (obj.Header.IsSubmitted == 0)
                    {
                        return new ResponseModel()
                        {
                            Data = null,
                            Message = "Updated Successfully",
                            Status = true
                        };
                    }
                    else
                    {
                        return new ResponseModel()
                        {
                            Data = null,
                            Message = "Posted Successfully",
                            Status = true
                        };
                    }



                }

            }
            catch (Exception Ex)
            {
                //  Logger.Instance.Error("Exception:", Ex);
                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went wrong",
                    Status = false
                };
            }



        }




        public async Task<object> GetAllAsync(Int32 customerid, string from_date, string to_date, Int32 BranchId, string PO, Int32 FilterType, Int32 type)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("opt", 1);
                param.Add("Order_id", 0);
                param.Add("orgid", 0);
                param.Add("branchid", BranchId);

                param.Add("customerid", customerid);
                param.Add("from_date", from_date);
                param.Add("to_date", to_date);
                param.Add("po_nbr", PO);
                param.Add("typeid", type);
                




                var List = await _connection.QueryAsync(Order.OrderProcedure, param: param, commandType: CommandType.StoredProcedure);
                var Modellist = List.ToList();


                return new ResponseModel()
                {
                    Data = Modellist,
                    Message = "Success",
                    Status = true
                };


            }
            catch (Exception Ex)
            {

                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went wrong",
                    Status = false
                };
            }
        }



        public async Task<object> GetByIdAsync(int orderid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 2);
                param.Add("@Order_id", orderid);
                param.Add("@orgid", 0);
                param.Add("@branchid", 0);
                param.Add("@ordertypeid", 0);

                param.Add("@customerid", 0);
                param.Add("@from_date", "");
                param.Add("@to_date", "");
                param.Add("@po_nbr", "");






                var List = await _connection.QueryMultipleAsync(Order.OrderProcedure, param: param, commandType: CommandType.StoredProcedure);
                dynamic Modellist = new ExpandoObject();
                int I = 0;
                while (!List.IsConsumed)
                {
                    dynamic nl = List.Read();

                    if (I == 0)
                    {
                        int count = nl.Count;
                        if (count == 0)
                        {
                            Modellist.Header = new object();
                        }
                        else
                        {
                            Modellist.Header = nl[0];
                        }
                    }
                    else if (I == 1)
                    {


                        Modellist.Detail = nl;
                    }
                    else if (I == 2)
                    {

                        Modellist.SQ_Details = nl;
                    }

                    I++;


                }


                return new ResponseModel()
                {
                    Data = Modellist,
                    Message = "Success",
                    Status = true
                };


            }
            catch (Exception Ex)
            {

                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went wrong",
                    Status = false
                };
            }
        }



        public async Task<object> GetBySoNoAsync(int unit)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@Opt", 3);
                param.Add("@branchid", unit);
                param.Add("@orgid", 0);
                param.Add("@order_id", 0);

                param.Add("@customerid", 0);
                param.Add("@from_date", "");
                param.Add("@to_date", "");
                param.Add("@po_nbr", "");

                var data = await _connection.QueryFirstOrDefaultAsync(Order.OrderProcedure, param: param, commandType: CommandType.StoredProcedure);



                return new ResponseModel()
                {
                    Data = data,
                    Message = "Success",
                    Status = true
                };


            }
            catch (Exception Ex)
            {

                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went wrong",
                    Status = false
                };
            }




        }


        public async Task<object> GetAllExportAsync(Int32 customerid, string from_date, string to_date, Int32 BranchId, string PO, Int32 FilterType)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 4);
                param.Add("@Order_id", 0);
                param.Add("@orgid", 0);
                param.Add("@branchid", BranchId);

                param.Add("@customerid", customerid);
                param.Add("@from_date", from_date);
                param.Add("@to_date", to_date);
                param.Add("@po_nbr", PO);







                var List = await _connection.QueryAsync(Order.OrderProcedure, param: param, commandType: CommandType.StoredProcedure);
                var Modellist = List.ToList();


                return new ResponseModel()
                {
                    Data = Modellist,
                    Message = "Success",
                    Status = true
                };


            }
            catch (Exception Ex)
            {

                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went wrong",
                    Status = false
                };
            }
        }










    }
}
