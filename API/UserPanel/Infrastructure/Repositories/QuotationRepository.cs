using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


using Dapper;
using System.Data;
using UserPanel.Infrastructure.Data;
using System.Transactions;
using MySqlX.XDevAPI.Common;
using Core.Models;
using Org.BouncyCastle.Bcpg;
using BackEnd.Quotation;
using Core.OrderMng.Quotation;
using Infrastructure.Repositories;
using DocumentFormat.OpenXml.Office2010.Excel;
using DocumentFormat.OpenXml.Wordprocessing;
using Mysqlx.Crud;
using Core.Abstractions;

public class QuotationRepository : IQuotationRepository
{

    private readonly IDbConnection _connection;
    string IPAddress = "";

    public QuotationRepository(IUnitOfWorkDB1 unitOfWork)
    {
        _connection = unitOfWork.Connection;
    }
    public async Task<object> AddAsync(QuotationItemsMain Obj)
    {
        try
        {

            int IsValidated = 0;
            string Message = "";
            Int32 Result = 0;
            SharedRepository SR = new SharedRepository(_connection);

            var response = await SR.GetSeqNumber(0, Obj.Header.SQ_Nbr, 1, Obj.Header.BranchId, Obj.Header.OrgId);
            if (response.Status == true)
            {
                if (response.Data.result == 1)
                {
                    IsValidated = 1;
                    Message = " - The current order number " + Obj.Header.SQ_Nbr + " is taken for another order so the new order number (" + response.Data.text + ") has been generated for this order";
                    Obj.Header.SQ_Nbr = response.Data.text;
                }
            }



            const string headerSql = @"
            INSERT INTO tbl_salesquatation_header 
            (SQ_Nbr, Sys_SQ_Nbr, SQ_Type, SQ_Date, OrderedBy, Subject, CustomerId, MainAddress, DeliveryAddress, 
             PhoneNumber, FaxNo, Email, CustomerAttention, Validity, DeliveryTerms, PaymentTerms, 
             PaymentMethod, SalesPerson, SalesPersonContact, SalesPersonEmail, CreatedBy, CreatedDate, createdip,
               IsActive, OrgId, BranchId,DeliveryAddressId,CustomerContactId,IsSubmitted,TermsAndCond,EffectiveFromDate,IsReadyToPost,IsSavedByDSO,Qtn_Day,Qtn_Month,TBA,IsSalesOrderSaved,IsWithCustomer)
            VALUES 
            (@SQ_Nbr, @Sys_SQ_Nbr, @SQ_Type, @SQ_Date, @OrderedBy, @Subject, @CustomerId, @MainAddress, @DeliveryAddress,
             @PhoneNumber, @FaxNo, @Email, @CustomerAttention, @Validity, @DeliveryTerms, @PaymentTerms, 
             @PaymentMethod, @SalesPerson, @SalesPersonContact, @SalesPersonEmail, @UserId, now(), 
             '',   1, @OrgId, @BranchId,@DeliveryAddressId,@CustomerContactId,@IsSubmit,@TermsAndCond,@EffectiveFromDate,@IsReadyToPost,@IsSavedByDSO,@Qtn_Day,@Qtn_Month,@TBA,@IsSalesOrderSaved,@IsWithCustomer);               
        ";

            await _connection.ExecuteAsync(headerSql, Obj.Header);

            const string getLastInsertedIdSql = "SELECT LAST_INSERT_ID();";
            var insertedHeaderId = await _connection.QuerySingleAsync<int>(getLastInsertedIdSql);

            Result = insertedHeaderId;
            string ContactOperationQuery = "";

            if (Obj.operation != null)
            {
                foreach (var row in Obj.operation)
                {
                    ContactOperationQuery += "INSERT INTO  `tbl_salesquatation_Cont_Operation`( `SQ_ID`,`ContactId`,`IsActive`,`CreatedDate`,`CreatedIP`)" +
                        "select " + insertedHeaderId + "," + row.CustomerContactId + ",1,now(),'192'; ";
                }
                if (Obj.operation.Count > 0)
                {
                    Result = await _connection.ExecuteAsync(ContactOperationQuery);
                }
            }
            foreach (var row in Obj.Details)
            {
                row.SQ_ID = insertedHeaderId;
                const string detailsql = @"
                INSERT INTO tbl_salesquatation_detail 
                (SQ_ID, GasCodeId, GasDescription, Volume, Po_No, Pressure, Qty, UOM, CurrencyId, UnitPrice, TotalPrice, 
                 ConvertedPrice, ConvertedCurrencyId, IsActive,Exchangerate, IsSoRaised)
                VALUES 
                ( @SQ_ID  , @GasCodeId, @GasDescription, @Volume, @Po_No, @Pressure, @Qty, @UOM, @CurrencyId, @UnitPrice,  @TotalPrice, @ConvertedPrice, @ConvertedCurrencyId, 1,@Exchangerate, 0);";
                Result = await _connection.ExecuteAsync(detailsql, row);
            }


            int BranchId = Obj.Header.BranchId;
            var UpdateSeq = "update master_documentnumber set Doc_Number=Doc_Number+1 where Doc_Type=1 and unit=" + BranchId;
            Result = await _connection.ExecuteAsync(UpdateSeq, BranchId);
            if (Obj.Header.IsSubmit == 1)
            {
                string RateUpdate = "update master_gascode as a inner join tbl_salesquatation_detail as b on a.id = b.gascodeid and b.isactive = 1 inner join tbl_salesquatation_header as c on c.id = b.sq_id and c.isactive = 1 and ifnull(c.IsSubmitted,0)= 1 set a.LastUpdatedPrice = b.unitprice where b.sq_id = " + insertedHeaderId + ";";
                Result = await _connection.ExecuteAsync(RateUpdate);
            }
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
                if (Obj.Header.IsSubmit == 0)
                {
                    return new ResponseModel()
                    {
                        Data = insertedHeaderId,
                        Message = "Saved Successfully" + Message,
                        Status = true
                    };
                }
                else
                {
                    return new ResponseModel()
                    {
                        Data = insertedHeaderId,
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


    public async Task<object> UpdateAsync(QuotationItemsMain obj)
    {
        try
        {


            if (obj.Header.isalreadypost == 1)
            {
                string GetInsertedData = "SELECT Id from tbl_salesquatation_header where Id=" + obj.Header.Id + " and ((IsSubmitted=1 and ifnull(IsSoTaken,0)=0) OR (IsSubmitted=0 and ifnull(IsSoTaken,0)=1) );";
                var PricechangeId = await _connection.QuerySingleOrDefaultAsync<int>(GetInsertedData);

                if (obj.Header.Id == PricechangeId)
                {


                    const string priceSql = @"
        UPDATE tbl_salesquatation_detail
        SET
            UnitPrice = @UnitPrice,
            TotalPrice = @TotalPrice,
            ConvertedPrice = @ConvertedPrice,
            Exchangerate=@Exchangerate
        WHERE Id = @Id ;";




                    foreach (var row in obj.Details)
                    {
                        //row.SQ_ID = header.Id;
                        if (row.Id > 0)
                        {
                            await _connection.ExecuteAsync(priceSql, row);
                        }

                    }
                    string RateUpdate = "update master_gascode as a inner join tbl_salesquatation_detail as b on a.id = b.gascodeid and b.isactive = 1 inner join tbl_salesquatation_header as c on c.id = b.sq_id and c.isactive = 1 and ifnull(c.IsSubmitted,0)= 1 set a.LastUpdatedPrice = b.unitprice where b.sq_id = " + obj.Header.Id + ";";
                    var Results_data = await _connection.ExecuteAsync(RateUpdate);
                    return new ResponseModel()
                    {
                        Data = null,
                        Message = "Price changed Successfully",
                        Status = true
                    };

                }
                else
                {
                    return new ResponseModel()
                    {
                        Data = null,
                        Message = "Price cannot be edited for this SQ.",
                        Status = false
                    };
                }
            }
            else
            {


                Int32 Result = 0;
                const string headerSql = @"
        UPDATE tbl_salesquatation_header
        SET
            SQ_Nbr = @SQ_Nbr,
            Sys_SQ_Nbr = @Sys_SQ_Nbr,
            SQ_Type = @SQ_Type,
            SQ_Date = @SQ_Date,
            OrderedBy = @OrderedBy,
            Subject = @Subject,
            CustomerId = @CustomerId,
            MainAddress = @MainAddress,
            DeliveryAddress = @DeliveryAddress,
            PhoneNumber = @PhoneNumber,
            FaxNo = @FaxNo,
            Email = @Email,
            CustomerAttention = @CustomerAttention,
            Validity = @Validity,
            DeliveryTerms = @DeliveryTerms,
            SalesPersonContact = @SalesPersonContact,
            PaymentTerms = @PaymentTerms,
            PaymentMethod = @PaymentMethod,
            SalesPerson = @SalesPerson,
            SalesPersonEmail = @SalesPersonEmail,
         
            LastModifiedBy = @UserId,
            LastModifiedDate = now(),
            LastModifiedIP ='',
            IsActive = 1,
            OrgId = @OrgId,
            BranchId = @BranchId,
            IsSubmitted=@IsSubmit,
            DeliveryAddressId=@DeliveryAddressId,
            CustomerContactId=@CustomerContactId,
            TermsAndCond=@TermsAndCond,
            EffectiveFromDate=@EffectiveFromDate,
            IsReadyToPost=@IsReadyToPost,
IsSavedByDSO =@IsSavedByDSO,
            Qtn_Day=@Qtn_Day,
            Qtn_Month=@Qtn_Month,
            TBA=@TBA,
            IsSalesOrderSaved =@IsSalesOrderSaved,
            IsWithCustomer=@IsWithCustomer
            where ID =@Id;
            
            ";


                await _connection.ExecuteAsync(headerSql, obj.Header);


                int HeaderId = obj.Header.Id;
                var UpdateSeq = "update tbl_salesquatation_detail set isactive=0 where sq_id=" + HeaderId + ";update tbl_salesquatation_Cont_Operation set isactive=0 where SQ_ID=" + HeaderId + ";";
                Result = await _connection.ExecuteAsync(UpdateSeq, HeaderId);


                string ContactOperationQuery = "";
                if (obj.operation != null)
                {
                    foreach (var row in obj.operation)
                    {
                        if (row.Id == 0)
                        {
                            ContactOperationQuery += "INSERT INTO  `tbl_salesquatation_Cont_Operation`( `SQ_ID`,`ContactId`,`IsActive`,`CreatedDate`,`CreatedIP`)" +
                                "select " + HeaderId + "," + row.CustomerContactId + ",1,now(),'192'; ";
                        }
                        else
                        {
                            ContactOperationQuery += "update tbl_salesquatation_Cont_Operation set isactive=1 where id=" + row.Id + ";";
                        }
                    }
                    if (obj.operation.Count > 0)
                    {
                        Result = await _connection.ExecuteAsync(ContactOperationQuery);
                    }
                }



                const string detailSql = @"
        UPDATE tbl_salesquatation_detail
        SET
            GasCodeId = @GasCodeId,
            GasDescription = @GasDescription,
            Volume = @Volume,
            Po_No = @Po_No,
            Pressure = @Pressure,
            Qty = @Qty,
            UOM = @UOM,
            CurrencyId = @CurrencyId,
            UnitPrice = @UnitPrice,
            TotalPrice = @TotalPrice,
            ConvertedPrice = @ConvertedPrice,
            ConvertedCurrencyId = @ConvertedCurrencyId,
            IsActive = 1,
            Exchangerate=@Exchangerate
        WHERE Id = @Id ;";


                const string Insertsql = @"
                INSERT INTO tbl_salesquatation_detail 
                (SQ_ID, GasCodeId, GasDescription, Volume, Po_No, Pressure, Qty, UOM, CurrencyId, UnitPrice, TotalPrice, 
                 ConvertedPrice, ConvertedCurrencyId, IsActive,Exchangerate)
                VALUES 
                ( @SQ_ID  , @GasCodeId, @GasDescription, @Volume, @Po_No, @Pressure, @Qty, @UOM, @CurrencyId, @UnitPrice,  @TotalPrice, @ConvertedPrice, @ConvertedCurrencyId, 1,@Exchangerate);";


                foreach (var row in obj.Details)
                {
                    //row.SQ_ID = header.Id;
                    if (row.Id > 0)
                    {
                        await _connection.ExecuteAsync(detailSql, row);
                    }
                    else if (row.Id == 0)
                    {
                        row.SQ_ID = HeaderId;
                        await _connection.ExecuteAsync(Insertsql, row);
                    }
                }

                if (obj.Header.IsSubmit == 1)
                {
                    string RateUpdate = "update master_gascode as a inner join tbl_salesquatation_detail as b on a.id = b.gascodeid and b.isactive = 1 inner join tbl_salesquatation_header as c on c.id = b.sq_id and c.isactive = 1 and ifnull(c.IsSubmitted,0)= 1 set a.LastUpdatedPrice = b.unitprice where b.sq_id = " + HeaderId + ";";
                    Result = await _connection.ExecuteAsync(RateUpdate);
                }

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
                    if (obj.Header.IsSubmit == 0)
                    {
                        return new ResponseModel()
                        {
                            Data = null,
                            Message = "Update Successfully",
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







    public async Task<object> GetAllAsync(Int32 sys_sqnbr, string from_date, string to_date, Int32 BranchId)
    {
        try
        {
            var param = new DynamicParameters();
            param.Add("opt", 1);
            param.Add("quotation_id", 0);
            param.Add("orgid", 0);
            param.Add("branchid", BranchId);
            param.Add("sys_sqnbr", sys_sqnbr);
            param.Add("from_date", from_date);
            param.Add("to_date", to_date);
            param.Add("userid", 0);
            param.Add("IPAddress", "");
            param.Add("Customer_Name", "");


            var List = await _connection.QueryAsync(Quotation.QuotationProcedure, param: param, commandType: CommandType.StoredProcedure);
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



    public async Task<object> GetByIdAsync(int Id)
    {
        try
        {
            var param = new DynamicParameters();
            param.Add("@Opt", 2);
            param.Add("@quotation_id", Id);
            param.Add("@orgid", 0);
            param.Add("@branchid", 0);

            param.Add("@sys_sqnbr", 0);
            param.Add("@from_date", "");
            param.Add("@to_date", "");
            param.Add("@userid", 0);
            param.Add("@IPAddress", "");
            param.Add("@Customer_Name", "");


            var List = await _connection.QueryMultipleAsync(Quotation.QuotationProcedure, param: param, commandType: CommandType.StoredProcedure);
            dynamic Modellist = new List<object>();

            while (!List.IsConsumed)
            {
                dynamic nl = List.Read();
                Modellist.Add(nl);
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







    public async Task<object> GetBySqNoAsync(int unit)
    {
        try
        {
            var param = new DynamicParameters();
            param.Add("@Opt", 3);
            param.Add("@branchid", unit);
            param.Add("@orgid", 0);
            param.Add("@quotation_id", 0);

            param.Add("@sys_sqnbr", 0);
            param.Add("@from_date", "");
            param.Add("@to_date", "");
            param.Add("@userid", 0);
            param.Add("@IPAddress", "");
            param.Add("@Customer_Name", "");

            var data = await _connection.QueryFirstOrDefaultAsync(Quotation.QuotationProcedure, param: param, commandType: CommandType.StoredProcedure);



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
    public async Task<object> CopyAsync(int Id)
    {
        try
        {
            var param = new DynamicParameters();
            param.Add("@Opt", 4);
            param.Add("@quotation_id", Id);
            param.Add("@orgid", 0);
            param.Add("@branchid", 0);


            param.Add("@sys_sqnbr", 0);
            param.Add("@from_date", "");
            param.Add("@to_date", "");
            param.Add("@userid", 0);
            param.Add("@IPAddress", "");
            param.Add("@Customer_Name", "");

            var List = await _connection.QueryMultipleAsync(Quotation.QuotationProcedure, param: param, commandType: CommandType.StoredProcedure);
            dynamic Modellist = new List<object>();

            while (!List.IsConsumed)
            {
                dynamic nl = List.Read();
                Modellist.Add(nl);
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

    public async Task<object> DeleteAsync(int Id, int IsActive, int userid)
    {
        try
        {
            string Message = "";
            var param = new DynamicParameters();
            param.Add("@Opt", IsActive == 0 ? 5 : 6);
            param.Add("@quotation_id", Id);
            param.Add("@orgid", 0);
            param.Add("@branchid", 0);


            param.Add("@sys_sqnbr", 0);
            param.Add("@from_date", "");
            param.Add("@to_date", "");
            param.Add("@userid", userid);
            param.Add("@IPAddress", "");
            param.Add("@Customer_Name", "");


            var Response = await _connection.QueryFirstOrDefaultAsync<int>(Quotation.QuotationProcedure, param: param, commandType: CommandType.StoredProcedure);
            if (IsActive == 0)
            {
                if (Response == 1)
                {
                    Message = "SQ was inactivated successfully";
                }
                else if (Response == 2)
                {
                    Message = "This SQ is already inactivated";
                }
                else if (Response == 3)
                {
                    Message = "SO is raised for this SQ";
                }

            }
            else
            {
                if (Response == 1)
                {
                    Message = "SQ was activated successfully";
                }
                else if (Response == 2)
                {
                    Message = "This SQ is already activated";
                }
                else if (Response == 3)
                {
                    Message = "SO is raised for this SQ";
                }

            }
            return new ResponseModel()
            {
                Data = Message,
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

    public async Task<object> Createcustomer(string CustomerName, int OrgId,int BranchId, int userid)
    {
        try
        {
            string Message = "";
            var param = new DynamicParameters();
            param.Add("@Opt", 7);
            param.Add("@quotation_id", 0);
            param.Add("@orgid", OrgId);
            param.Add("@branchid", BranchId);
            param.Add("@sys_sqnbr", 0);
            param.Add("@from_date", "");
            param.Add("@to_date", "");
            param.Add("@userid", userid);
            param.Add("@IPAddress", "");
            param.Add("@Customer_Name", CustomerName);


            var Response = await _connection.QueryFirstOrDefaultAsync<int>(Quotation.QuotationProcedure, param: param, commandType: CommandType.StoredProcedure);
            
                if (Response > 0)
                {
                    Message = "Customer created successfully";
                }
                else if (Response == 0)
                {
                    Message = "The Customer is already exists";
                }
            return new ResponseModel()
            {
                Data = Response,
                Message = Message,
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































