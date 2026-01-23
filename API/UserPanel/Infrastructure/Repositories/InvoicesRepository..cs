using System;
using System.Collections.Generic;
using System.Data;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BackEnd.Invoices;
using Core.Abstractions;
using Core.Models;
using Core.OrderMng.Invoices;
using Core.OrderMng.Quotation;
using Core.OrderMng.SaleOrder;
using Dapper;
using MediatR;
using UserPanel.Infrastructure.Data;


namespace Infrastructure.Repositories
{
    public class InvoicesRepository : IInvoicesRepository
    {

        private readonly IDbConnection _connection;
        string IPAddress = "";
        public InvoicesRepository(IUnitOfWorkDB1 unitOfWork)
        {
            _connection = unitOfWork.Connection;
        }


        public async Task<object> AddAsync(InvoiceItemMain Obj)
        {
            try
            {
                var salesInvoiceNo = @"select count(1) from tbl_salesinvoices_header where salesinvoicenbr = @salesinvoicenbr";
                var exists = await _connection.ExecuteScalarAsync<int>( salesInvoiceNo, new { salesinvoicenbr = Obj.Header.SalesInvoiceNbr } );
                string Message = "";
                if (exists > 0)
                {

                    return new ResponseModel()
                    {
                        Data = null,
                        Message = " Invoice Number Already Exist" + Message,
                        Status = true
                    };
                }
                int IsValidated = 0;
                    Int32 Result = 0;
                    SharedRepository SR = new SharedRepository(_connection);

                    var response = await SR.GetSeqNumber(0, Obj.Header.SalesInvoiceNbr, 4, Obj.Header.BranchId, Obj.Header.OrgId);
                    if (response.Status == true)
                    {
                        if (response.Data.result == 1)
                        {
                            IsValidated = 1;
                            Message = " - The current order number " + Obj.Header.SalesInvoiceNbr + " is taken for another order so the new order number (" + response.Data.text + ") has been generated for this order";
                            Obj.Header.SalesInvoiceNbr = response.Data.text;
                        }
                    }


                    const string headerSql = @"
            INSERT INTO tbl_salesinvoices_header
            (SalesInvoiceNbr, CustomerId, Salesinvoicesdate, TotalAmount, TotalQty, IsSubmitted, OrgId, BranchId, CreatedBy, CreatedDate,ismanual, CalculatedPrice)
            VALUES (@SalesInvoiceNbr, @CustomerId, now(), @TotalAmount, @TotalQty, @IsSubmitted, @OrgId, @BranchId,  @UserId, NOW(),@ismanual, @CalculatedPrice);
        ";


                    await _connection.ExecuteAsync(headerSql, Obj.Header);


                    const string getLastInsertedIdSql = "SELECT LAST_INSERT_ID();";
                    var insertedHeaderId = await _connection.QuerySingleAsync<int>(getLastInsertedIdSql);


                    if (Obj.Header.ismanual == 0)
                    {

                        foreach (var row in Obj.DODetail)
                        {
                            row.SalesInvoicesId = insertedHeaderId;

                            const string deliveryOrderSql = @"
                INSERT INTO tbl_salesinvoices_packingdetail
                (SalesInvoicesId, PackingId,doid,  CreatedDate)
                VALUES 
                (@SalesInvoicesId, @PackingId,@doid,  NOW());
            ";

                            Result = await _connection.ExecuteAsync(deliveryOrderSql, row);
                        }


                        foreach (var row in Obj.Details)
                        {

                            string getpackingid = "SELECT * from tbl_salesinvoices_packingdetail where SalesInvoicesId=" + insertedHeaderId + " and PackingId=" + row.packingid + ";";
                            var packingdetailsid = await _connection.QuerySingleAsync<int>(getpackingid);

                            row.PackingDetailId = packingdetailsid;

                            row.SalesInvoicesId = insertedHeaderId;

                            const string detailSql = @"
                                       INSERT INTO tbl_salesinvoices_details
                             (sqid,salesinvoicesheaderid, invoicespackingdetailid, PONumber, DeliveryNumber, GasCodeId, PickedQty, uomid, Currencyid, UnitPrice, TotalPrice, Price, DeliveryAddress, DriverName, TruckName, IsActive,ConvertedCurrencyId)
                             VALUES 
                             (@sqid,@SalesInvoicesId, @PackingDetailId, @PoNumber, @DeliveryNumber, @GasCodeId, @PickedQty, @uomid, @Currencyid, @UnitPrice, @TotalPrice, @Price, @DeliveryAddress, @DriverName, @TruckName, 1,@ConvertedCurrencyId);
                             SELECT LAST_INSERT_ID();";

                            Result = await _connection.ExecuteAsync(detailSql, row);
                        }
                    }
                    else
                    {

                        foreach (var row in Obj.Details)
                        {
                        //string getpackingid = "SELECT * from tbl_salesinvoices_packingdetail where SalesInvoicesId=" + insertedHeaderId + " and PackingId=" + row.packingid + ";";
                        //var packingdetailsid = await _connection.QuerySingleAsync<int>(getpackingid);

                        row.SalesInvoicesId = insertedHeaderId;

                            const string detailSql = @"
                                       INSERT INTO tbl_salesinvoices_details
                             (sqid,salesinvoicesheaderid, invoicespackingdetailid, PONumber, DeliveryNumber, GasCodeId, PickedQty, uomid, Currencyid, UnitPrice, TotalPrice, Price, DeliveryAddress, DriverName, TruckName, IsActive,ConvertedCurrencyId, DOnumber)
                             VALUES 
                             (@sqid,@SalesInvoicesId, null, @PoNumber, @DeliveryNumber, @GasCodeId, @PickedQty, @uomid, @Currencyid, @UnitPrice, @TotalPrice, @Price, @DeliveryAddress, @DriverName, @TruckName, 1,@ConvertedCurrencyId, @DOnumber);
                             SELECT LAST_INSERT_ID();";

                            Result = await _connection.ExecuteAsync(detailSql, row);
                        }
                    }




                    int BranchId = Obj.Header.BranchId;
                    if (Obj.Header.ismanual == 0)
                    {
                        var updateSeq = "UPDATE master_documentnumber SET Doc_Number = Doc_Number + 1 WHERE Doc_Type = 4 AND Unit = @BranchId;  call proc_updatepackingstatus(1," + insertedHeaderId + ") ";
                        Result = await _connection.ExecuteAsync(updateSeq, new { BranchId });
                    }
                    else
                    {
                        var updateSeq = "UPDATE master_documentnumber SET Doc_Number = Doc_Number + 1 WHERE Doc_Type = 8 AND Unit = @BranchId;  call proc_updatepackingstatus(1," + insertedHeaderId + ") ";
                        Result = await _connection.ExecuteAsync(updateSeq, new { BranchId });
                    }
                    Result = 1;

                    if (Result == 0)
                    {
                        return new ResponseModel()
                        {
                            Data = null,
                            Message = "Save failed",
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

                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went wrong",
                    Status = false
                };
            }



        }

        public async Task<object> UpdateAsync(InvoiceItemMain Obj)
        {
            try
            {

                var currentInvoiceNbr = await _connection.ExecuteScalarAsync<string>(
             "SELECT SalesInvoiceNbr FROM tbl_salesinvoices_header WHERE Id = @Id",
             new { Id = Obj.Header.Id }
         );

                // 2. If the invoice number changed, check duplicates
                if (!string.Equals(currentInvoiceNbr, Obj.Header.SalesInvoiceNbr, StringComparison.OrdinalIgnoreCase))
                {
                    var exists = await _connection.ExecuteScalarAsync<int>(
                        @"SELECT COUNT(1) 
                  FROM tbl_salesinvoices_header 
                  WHERE SalesInvoiceNbr = @SalesInvoiceNbr 
                    AND Id <> @Id",
                        new { SalesInvoiceNbr = Obj.Header.SalesInvoiceNbr, Id = Obj.Header.Id }
                    );

                    if (exists > 0)
                    {
                        return new ResponseModel()
                        {
                            Data = null,
                            Message = "Invoice Number already exists.",
                            Status = false
                        };
                    }
                }

                int Result = 0;


                const string headerSql = @"
        UPDATE tbl_salesinvoices_header
        SET 
            SalesInvoiceNbr = @SalesInvoiceNbr,
            CustomerId = @CustomerId,
            Salesinvoicesdate = NOW(),
            TotalAmount = @TotalAmount,
            TotalQty = @TotalQty,
            IsSubmitted = @IsSubmitted,
            OrgId = @OrgId,
            BranchId = @BranchId,
            updatedby = @UserId,
            LastModifiedDate = NOW(),
CalculatedPrice = @CalculatedPrice
        WHERE Id = @Id;
        ";


                await _connection.ExecuteAsync(headerSql, Obj.Header);

                int HeaderId = Obj.Header.Id;

                if (Obj.Header.ismanual == 0)
                {
                    const string updateDeliveryOrderSql = @"
        UPDATE tbl_salesinvoices_packingdetail
        SET 
            PackingId = @PackingId,
            LastModifiedDate = NOW()
        WHERE SalesInvoicesId = @salesinvoicesid;
        ";

                    foreach (var row in Obj.DODetail)
                    {
                        row.SalesInvoicesId = HeaderId;
                        await _connection.ExecuteAsync(updateDeliveryOrderSql, row);
                    }
                }


                const string deleteDetailsSql = @"
        UPDATE tbl_salesinvoices_details
        SET IsActive = 0
        WHERE salesinvoicesheaderid = @SalesInvoicesId;
        ";



                await _connection.ExecuteAsync(deleteDetailsSql, new { SalesInvoicesId = HeaderId });


                string detailSql = "";
                if (Obj.Header.ismanual == 0)
                {

                    detailSql = @"
        INSERT INTO tbl_salesinvoices_details
        (sqid,salesinvoicesheaderid, invoicespackingdetailid, PONumber, DeliveryNumber, GasCodeId, PickedQty, uomid, Currencyid, UnitPrice, TotalPrice, Price, DeliveryAddress, DriverName, TruckName, IsActive,ConvertedCurrencyId, DoNumber)
        VALUES 
        (@sqid,@SalesInvoicesId, @PackingDetailId, @PoNumber, @DeliveryNumber, @GasCodeId, @PickedQty, @uomid, @Currencyid, @UnitPrice, @TotalPrice, @Price, @DeliveryAddress, @DriverName, @TruckName, 1,@ConvertedCurrencyId, @DoNumber);
        ";
                }
                else
                {
                    detailSql = @"
        INSERT INTO tbl_salesinvoices_details
        (sqid,salesinvoicesheaderid, invoicespackingdetailid, PONumber, DeliveryNumber, GasCodeId, PickedQty, uomid, Currencyid, UnitPrice, TotalPrice, Price, DeliveryAddress, DriverName, TruckName, IsActive,ConvertedCurrencyId, DoNumber)
        VALUES 
        (@sqid,@SalesInvoicesId, null, @PoNumber, @DeliveryNumber, @GasCodeId, @PickedQty, @uomid, @Currencyid, @UnitPrice, @TotalPrice, @Price, @DeliveryAddress, @DriverName, @TruckName, 1,@ConvertedCurrencyId, @DoNumber);
        ";
                }
                foreach (var row in Obj.Details)
                {
                    if (Obj.Header.ismanual == 0)
                    {

                        string getpackingid = "SELECT * from tbl_salesinvoices_packingdetail where SalesInvoicesId=" + Obj.Header.Id + " and PackingId=" + row.packingid + ";";
                        var packingdetailsid = await _connection.QuerySingleAsync<int>(getpackingid);

                        row.PackingDetailId = packingdetailsid;
                    }


                    row.SalesInvoicesId = HeaderId;
                    if (row.Id == 0)
                    {
                        await _connection.ExecuteAsync(detailSql, row);
                    }
                    else
                    {
                        //string updatesql = @"update tbl_salesinvoices_details set isactive=1 where id=" + row.Id + ";";
                        string updatesql = @"
UPDATE tbl_salesinvoices_details
SET 
    sqid = @sqid,
    PONumber = @PoNumber,
    DeliveryNumber = @DeliveryNumber,
    GasCodeId = @GasCodeId,
    PickedQty = @PickedQty,
    uomid = @uomid,
    Currencyid = @Currencyid,
    UnitPrice = @UnitPrice,
    TotalPrice = @TotalPrice,
    Price = @Price,
    DeliveryAddress = @DeliveryAddress,
    DriverName = @DriverName,
    TruckName = @TruckName,
    IsActive = 1,
    ConvertedCurrencyId = @ConvertedCurrencyId,
    DoNumber = @DoNumber
WHERE Id = @Id;
";
                        await _connection.ExecuteAsync(updatesql, row);
                    }
                }


                if (Obj.Header.IsSubmitted == 0)
                {
                    return new ResponseModel()
                    {
                        Data = null,
                        Message = "Invoice updated successfully",
                        Status = true
                    };
                }
                else
                {
                    return new ResponseModel()
                    {
                        Data = null,
                        Message = "Invoice posted successfully",
                        Status = true
                    };
                }
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
        public async Task<object> GetAllAsync(Int32 customerid, string from_date, string to_date, Int32 BranchId, int typeid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 1);
                param.Add("@Order_id", 0);
                param.Add("@orgid", 0);
                param.Add("@branchid", BranchId);

                param.Add("@customerid", customerid);
                param.Add("@from_date", from_date);
                param.Add("@to_date", to_date);
                param.Add("@invoices_id", 0);
                param.Add("@typeid", typeid);


                var List = await _connection.QueryAsync(Invoices.InvoicesProcedure, param: param, commandType: CommandType.StoredProcedure);
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

        public async Task<object> GetByIdAsync(int Invoicesid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 2);

                param.Add("@invoices_id", Invoicesid);
                param.Add("@orgid", 0);
                param.Add("@branchid", 0);
                param.Add("@ordertypeid", 0);

                param.Add("@customerid", 0);
                param.Add("@from_date", "");
                param.Add("@to_date", "");
                param.Add("@typeid", 0);






                var List = await _connection.QueryMultipleAsync(Invoices.InvoicesProcedure, param: param, commandType: CommandType.StoredProcedure);
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


                        Modellist.Details = nl;
                    }
                    else if (I == 2)
                    {

                        Modellist.DoDetail = nl;
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

        public async Task<object> GetBySiNoAsync(int unit, int typeid)
        {

            try
            {
                var param = new DynamicParameters();
                param.Add("@Opt", 3);
                param.Add("@branchid", unit);
                param.Add("@orgid", 0);
                param.Add("@invoices_id", 0);

                param.Add("@customerid", 0);
                param.Add("@from_date", "");
                param.Add("@to_date", "");
                param.Add("@typeid", typeid);

                var data = await _connection.QueryFirstOrDefaultAsync(Invoices.InvoicesProcedure, param: param, commandType: CommandType.StoredProcedure);



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
    }
}



