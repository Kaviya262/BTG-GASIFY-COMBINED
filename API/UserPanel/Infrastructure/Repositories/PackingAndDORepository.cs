using BackEnd.Master;
using BackEnd.PackingAndDO;
using BackEnd.Quotation;
using Core.Abstractions;
using Core.Master.Cylinder;
using Core.Models;
using Core.OrderMng.PackingAndDO;
using Core.OrderMng.SaleOrder;
using Dapper;
using DocumentFormat.OpenXml.Drawing;
using DocumentFormat.OpenXml.Drawing.Diagrams;
using DocumentFormat.OpenXml.Office2010.Excel;
using DocumentFormat.OpenXml.Spreadsheet;
using DocumentFormat.OpenXml.Wordprocessing;
using MediatR;
using Mysqlx.Crud;
using Mysqlx.Session;
using MySqlX.XDevAPI.Common;
using System;
using System.Collections.Generic;
using System.Data;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UserPanel.Infrastructure.Data;

namespace Infrastructure.Repositories
{
    public class PackingAndDORepository : IPackingAndDORepository
    {
        private readonly IDbConnection _connection;

        public PackingAndDORepository(IUnitOfWorkDB1 unitOfWork)
        {
            _connection = unitOfWork.Connection;
        }

        public async Task<object> DownloadDO(int Id)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 2);
                param.Add("@packing_id", Id);
                param.Add("@userid", 0);
                param.Add("@branchid", 0);

                param.Add("@sys_packnbr", 0);
                param.Add("@from_date", "");
                param.Add("@to_date", "");
                param.Add("@DOID", "");
                param.Add("@FilterGasCodeId", 0);

                param.Add("@filter_customerid", 0);
                param.Add("@filter_esttime", "0");
                param.Add("@filter_packerid", 0);


                var List = await _connection.QueryMultipleAsync(PackingAndDO.PackingAndDOProcedure, param: param, commandType: CommandType.StoredProcedure);
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

        public async Task<ResponseModel> UploadDO(int Id, string Path, DataSet DS)
        {
            int Result = 0;
            try
            {
                string updatecylinderlocation = "update master_cylinder as mc join tbl_packing_deliverydetail as pdd on pdd.barcode=mc.barcode and ifnull(pdd.isactive,0)=1  ";
                updatecylinderlocation += " join tbl_packing_customerdetail as pcd on pcd.id=pdd.customerdtlid and pcd.isactive=1";
                updatecylinderlocation += " join master_customeraddress as ca on ca.customerid=pcd.customerid and ca.isactive=1 and ca.addresstypeid=2";
                updatecylinderlocation += " set mc.location='BTG'";
                updatecylinderlocation += " where pdd.packingid=" + Id + " and pdd.isactive=1 ;  ";
                Result = await _connection.ExecuteAsync(updatecylinderlocation);


                var Updatepacking = "update tbl_packing_header set FilePath='" + Path + "',isdouploaded=1 where id=" + Id+";";
                Updatepacking += " update tbl_packing_customerdetail set isdouploaded=1 where packingid=" + Id + ";";
                Result = await _connection.ExecuteAsync(Updatepacking);
                string Updatebarcode = "";
                foreach (DataTable row in DS.Tables)
                {
                    foreach (DataRow item in row.Rows)
                    {

                        Updatebarcode += "update tbl_packing_deliverydetail set BarCode='" + item["BarCode"].ToString() + "' where id=" + item["RefId"].ToString() + ";  ";

                    }
                }

                Result = await _connection.ExecuteAsync(Updatebarcode);

                updatecylinderlocation = "";

                 updatecylinderlocation += "update master_cylinder as mc join tbl_packing_deliverydetail as pdd on pdd.barcode=mc.barcode and ifnull(pdd.isactive,0)=1 ";
                updatecylinderlocation += " join tbl_packing_customerdetail as pcd on pcd.id=pdd.customerdtlid and pcd.isactive=1";
                updatecylinderlocation += " join master_customeraddress as ca on ca.customerid=pcd.customerid and ca.isactive=1 and ca.addresstypeid=2";
                updatecylinderlocation += " set mc.location=ca.location";
                updatecylinderlocation += " where pdd.packingid="+ Id + " and pdd.isactive=1 ;  ";

                Result = await _connection.ExecuteAsync(updatecylinderlocation);

                return new ResponseModel()
                {
                    Data = null,
                    Message = "File Uploaded Successfully",
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
        public async Task<object> GetAllAsync(Int32 packerid, string from_date, string to_date, Int32 BranchId,int GasCodeId,int customerid,string esttime,int packer_id)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 1);
                
                param.Add("@packing_id", packerid);
                param.Add("@userid", 0);
                param.Add("@branchid", BranchId);

                param.Add("@sys_packnbr", 0);
                param.Add("@from_date", from_date);
                param.Add("@to_date", to_date);
                param.Add("@DOID", "");
                    param.Add("@FilterGasCodeId", GasCodeId);

                 
                    param.Add("@filter_customerid", customerid);
                    param.Add("@filter_esttime", esttime);
                    param.Add("@filter_packerid", packer_id);

                var List = await _connection.QueryMultipleAsync(PackingAndDO.PackingAndDOProcedure, param: param, commandType: CommandType.StoredProcedure);
               

                dynamic Modellist = new ExpandoObject();
                int I = 0;
                while (!List.IsConsumed)
                {
                    dynamic nl = List.Read();
                     
                     if (I == 0)
                    {


                        Modellist.Details = nl;
                    }
                    else if (I == 1)
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


        public async Task<object> GetByPackNoAsync(int unit)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 3);


                param.Add("@packing_id", 0);
                param.Add("@userid", 0);
                param.Add("@branchid", unit);

                param.Add("@sys_packnbr", 0);
                param.Add("@from_date", "");
                param.Add("@to_date", "");
                param.Add("@DOID", "");
                param.Add("@FilterGasCodeId", 0);

                param.Add("@filter_customerid", 0);
                param.Add("@filter_esttime", "0");
                param.Add("@filter_packerid", 0);

                var data = await _connection.QueryFirstOrDefaultAsync(PackingAndDO.PackingAndDOProcedure, param: param, commandType: CommandType.StoredProcedure);


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
        public async Task<object> AddAsync(PackingAndDOItems Obj)
            {
            try
            {
                int IsValidated = 0;
                string Message = "";
                Int32 Result = 0;
                SharedRepository SR = new SharedRepository(_connection);

                var response = await SR.GetSeqNumber(0, Obj.Header.PackNo, 6, Obj.Header.BranchId, Obj.Header.OrgId);
                if (response.Status == true)
                {
                    if (response.Data.result == 1)
                    {
                        IsValidated = 1;
                        Message = " - The current order number " + Obj.Header.PackNo + " is taken for another order so the new order number (" + response.Data.text + ") has been generated for this order";
                        Obj.Header.PackNo = response.Data.text;
                    }
                }



                const string headerSql = @" INSERT INTO  `tbl_packing_header`(`RackId`,`RackNo`,`packingpersonid`,`pdldate`,`isactive`,`IsSubmitted`,`OrgId`,`BranchId`,`createdby`,`CreatedDate`,`CreatedIP`,`PackNo`,`DONo`,`esttime`,`PackingType`)
           VALUES(@RackId,@RackNo,@packingpersonid, @pdldate, 1,  @IsSubmitted, @OrgId, @BranchId,@UserId,now(),'',@PackNo,0,@esttime,@PackingType); ";


                await _connection.ExecuteAsync(headerSql, Obj.Header);

                const string getLastInsertedIdSql = "SELECT LAST_INSERT_ID();";
                var insertedHeaderId = await _connection.QuerySingleAsync<int>(getLastInsertedIdSql);
                string customersql = "";
                foreach (var row in Obj.Customers)
                {
                    row.PackingId = insertedHeaderId;
                    customersql += @"INSERT INTO `tbl_packing_customerdetail`(`packingid`,`customerid`,`isactive`,`createdby`,`CreatedDate`,`CreatedIP`)
                                               VALUES (" + row.PackingId + "," + row.CustomerId + ", 1," + Obj.Header.UserId + ",now(),''); ";
                }
                Result = await _connection.ExecuteAsync(customersql);


                string PackingSOsql = "";
                if (Obj.SODtl != null)
                {
                    foreach (var row in Obj.SODtl)
                    {
                        row.PackingId = insertedHeaderId;
                        PackingSOsql += @"INSERT INTO `tbl_packing_sodetail`( `packingid`,`customerid`,`soid`,`isactive`,`createdby` ,`CreatedDate`,`CreatedIP`,  `Customerdtlid`)
                                select " + row.PackingId + "," + row.CustomerId + ", " + row.SOID + ",1," + Obj.Header.UserId + ",now(),'',id from tbl_packing_customerdetail where isactive=1 and customerid=" + row.CustomerId + " and packingid=" + row.PackingId + ";";
                    }
                    Result = await _connection.ExecuteAsync(PackingSOsql);
                }

                string PackingGassql = "";
                if (Obj.GasDtl != null)
                {
                    foreach (var row in Obj.GasDtl)
                    {
                        row.PackingId = insertedHeaderId;
                        PackingGassql += @"INSERT INTO `tbl_packing_gasdetail`( `packingid`,`customerid`,`gascodeid`,`isactive`,`createdby` ,`CreatedDate`,`CreatedIP`,  `Customerdtlid`)
                                select " + row.PackingId + "," + row.CustomerId + ", " + row.gascodeid + ",1," + Obj.Header.UserId + ",now(),'',id from tbl_packing_customerdetail where isactive=1 and customerid=" + row.CustomerId + " and packingid=" + row.PackingId + ";";

                    }
                    if (Obj.GasDtl.Count > 0)
                    {
                        Result = await _connection.ExecuteAsync(PackingGassql);
                    }
                }

                Result = insertedHeaderId;
                string sqdetailsql = "";
                foreach (var row in Obj.Details)
                {
                    row.packerheaderid = insertedHeaderId;



                    //row.Sqdtlid= SQID;
                    sqdetailsql += @"INSERT INTO `tbl_packing_details`(`SQID`,`packerheaderid`,`sodetailid`,`gascodeid`,`soqty`,`pickqty`,`drivername`,`trucknumber`,`ponumber`,`requestdeliverydate`,`deliveryaddress`,`deliveryinstruction`,`Volume`,`Pressure`,`SQ_Qty`,`CurrencyId`,`UnitPrice`,`TotalPrice`,`ConvertedPrice`,`ConvertedCurrencyId`,`ExchangeRate`,`So_Issued_Qty`,`Balance_Qty`,`isactive`,`uomid`,`packing_gas_detailid`) 
                select " + row.SQID + ", " + row.packerheaderid + ", a.id, " + row.gascodeid + ", " + row.soqty + "," + row.pickqty + ", '" + row.drivername + "', '" + row.trucknumber + "', '" + row.ponumber + "','" + row.requestdeliverydate + "','" + row.deliveryaddress + "','" + row.deliveryinstruction + "', '" + row.Volume + "','" + row.Pressure + "', " + row.SQ_Qty + "," + row.CurrencyId + "," + row.UnitPrice + "," + row.TotalPrice + "," + row.ConvertedPrice + "," + row.ConvertedCurrencyId + "," + row.ExchangeRate + "," + row.So_Issued_Qty + "," + row.Balance_Qty + ",1," + row.uomid + ",b.id   from tbl_packing_sodetail as a left join tbl_packing_gasdetail as b on b.customerid=a.customerid and b.packingid= " + row.packerheaderid + " and b.gascodeid=" + row.gascodeid + " where a.packingid=" + row.packerheaderid + " and a.soid=" + row.soid + " ;";



                }

                Result = await _connection.ExecuteAsync(sqdetailsql);
                int BranchId = Obj.Header.BranchId;
                var UpdateSeq = "update master_documentnumber set Doc_Number=Doc_Number+1 where Doc_Type=6 and unit=" + BranchId+ "; call proc_SalesOrder_Bal_Update(1,"+ insertedHeaderId + ") ";
                Result = await _connection.ExecuteAsync(UpdateSeq, BranchId);
                Result = 1;

 

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
                            Message = "Saved Successfully"+ Message,
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

        public async Task<object> UpdateAsync(PackingAndDOItems Obj)
        {

            try
            {
                Int32 Result = 0;


                string headerSql = @"UPDATE `tbl_packing_header` SET `PackingType`="+Obj.Header.PackingType+", `RackId`=" + Obj.Header.RackId+ ",`RackNo`='" + Obj.Header.RackNo + "' ,`packingpersonid` =" + Obj.Header.packingpersonid + "  ,`IsSubmitted` = " + Obj.Header.IsSubmitted + ",`updatedby` = " + Obj.Header.UserId + ",`LastModifiedIP` = '' ,`LastModifiedDate` =now(),`esttime`='" + Obj.Header.esttime + "' WHERE `id` = " + Obj.Header.id + "; ";


                await _connection.ExecuteAsync(headerSql, Obj.Header);
                var insertedHeaderId = Obj.Header.id;




                var UpdateCustomer = "update tbl_packing_customerdetail set isactive=0 where packingid =" + insertedHeaderId;
                Result = await _connection.ExecuteAsync(UpdateCustomer);

                string customersql = "";
                foreach (var row in Obj.Customers)
                {
                    row.PackingId = insertedHeaderId;
                    if (row.id == 0)
                    {
                        customersql += @"INSERT INTO `tbl_packing_customerdetail`(`packingid`,`customerid`,`isactive`,`createdby`,`CreatedDate`,`CreatedIP`)
                                       VALUES (" + row.PackingId + "," + row.CustomerId + ", 1," + Obj.Header.UserId + ",now(),''); ";
                    }
                    else if (row.CustomerId > 0)
                    {

                        customersql += @"UPDATE `tbl_packing_customerdetail` set 
                 `isactive` = 1
             WHERE `packingid` = " + row.PackingId + "; ";
                    }
                }
                Result = await _connection.ExecuteAsync(customersql);




                var Updateso = "update tbl_packing_sodetail set isactive=0 where packingid =" + insertedHeaderId+ ";  update tbl_packing_gasdetail set isactive=0 where packingid =" + insertedHeaderId+";";
                Result = await _connection.ExecuteAsync(Updateso);



                string PackingSOsql = "";
                if (Obj.SODtl != null)
                {
                    foreach (var row in Obj.SODtl)
                    {
                        row.PackingId = insertedHeaderId;

                        if (row.id == 0)
                        {
                            PackingSOsql += @"INSERT INTO `tbl_packing_sodetail`( `packingid`,`customerid`,`soid`,`isactive`,`createdby` ,`CreatedDate`,`CreatedIP`,  `Customerdtlid`)
                        select " + row.PackingId + "," + row.CustomerId + ", " + row.SOID + ",1," + Obj.Header.UserId + ",now(),'',id from tbl_packing_customerdetail where isactive=1 and customerid=" + row.CustomerId + " and packingid=" + row.PackingId + ";";
                        }
                        else
                        {

                            PackingSOsql += @"UPDATE `tbl_packing_sodetail` set  `isactive` = 1   WHERE `id` = " + row.id + "; ";

                        }
                    }
                    Result = await _connection.ExecuteAsync(PackingSOsql);
                }

                string PackingGassql = "";
                if (Obj.GasDtl != null)
                {
                    foreach (var row in Obj.GasDtl)
                    {
                        row.PackingId = insertedHeaderId;

                        if (row.id == 0)
                        {
                            PackingGassql += @"INSERT INTO `tbl_packing_gasdetail`( `packingid`,`customerid`,`gascodeid`,`isactive`,`createdby` ,`CreatedDate`,`CreatedIP`,  `Customerdtlid`)
                        select " + row.PackingId + "," + row.CustomerId + ", " + row.gascodeid + ",1," + Obj.Header.UserId + ",now(),'',id from tbl_packing_customerdetail where isactive=1 and customerid=" + row.CustomerId + " and packingid=" + row.PackingId + ";";
                        }
                        else
                        {

                            PackingGassql += @"UPDATE `tbl_packing_gasdetail` set 
                 `isactive` = 1
             WHERE `id` = " + row.id + "; ";

                        }
                    }
                    if (Obj.GasDtl.Count > 0)
                    {
                        Result = await _connection.ExecuteAsync(PackingGassql);
                    }
                }




                var Updatedetails = "update tbl_packing_details set isactive=0 where packerheaderid =" + insertedHeaderId;
                Result = await _connection.ExecuteAsync(Updatedetails);


                Result = insertedHeaderId;
                string sqdetailsql = "";
                foreach (var row in Obj.Details)
                {
                    row.packerheaderid = insertedHeaderId;


                    if (row.id == 0)
                    {

                        sqdetailsql += @"INSERT INTO `tbl_packing_details`(`SQID`,`packerheaderid`,`sodetailid`,`gascodeid`,`soqty`,`pickqty`,`drivername`,`trucknumber`,`ponumber`,`requestdeliverydate`,`deliveryaddress`,`deliveryinstruction`,`Volume`,`Pressure`,`SQ_Qty`,`CurrencyId`,`UnitPrice`,`TotalPrice`,`ConvertedPrice`,`ConvertedCurrencyId`,`ExchangeRate`,`So_Issued_Qty`,`Balance_Qty`,`isactive`,`uomid`,`packing_gas_detailid`) 
                select " + row.SQID + ", " + row.packerheaderid + ", a.id, " + row.gascodeid + ", " + row.soqty + "," + row.pickqty + ", '" + row.drivername + "', '" + row.trucknumber + "', '" + row.ponumber + "','" + row.requestdeliverydate + "','" + row.deliveryaddress + "','" + row.deliveryinstruction + "', '" + row.Volume + "','" + row.Pressure + "', " + row.SQ_Qty + "," + row.CurrencyId + "," + row.UnitPrice + "," + row.TotalPrice + "," + row.ConvertedPrice + "," + row.ConvertedCurrencyId + "," + row.ExchangeRate + "," + row.So_Issued_Qty + "," + row.Balance_Qty + ",1," + row.uomid + ",b.id   from tbl_packing_sodetail as a left join tbl_packing_gasdetail as b on b.customerid=a.customerid and b.isactive=1 and b.packingid= " + row.packerheaderid + " and b.gascodeid=" + row.gascodeid + " where a.isactive=1 and a.packingid=" + row.packerheaderid + " and a.soid=" + row.soid + " ;";


        //                //row.Sqdtlid= SQID;
        //                sqdetailsql += @"INSERT INTO `tbl_packing_details`(`SQID`,`packerheaderid`,`sodetailid`,`gascodeid`,`soqty`,`pickqty`,`drivername`,`trucknumber`,`ponumber`,`requestdeliverydate`,`deliveryaddress`,`deliveryinstruction`,`Volume`,`Pressure`,`SQ_Qty`,`CurrencyId`,`UnitPrice`,`TotalPrice`,`ConvertedPrice`,`ConvertedCurrencyId`,`ExchangeRate`,`So_Issued_Qty`,`Balance_Qty`,`isactive`,`uomid`) 
        //select " + row.SQID + "," + row.packerheaderid + ", id, " + row.gascodeid + ", " + row.soqty + "," + row.pickqty + ", '" + row.drivername + "', '" + row.trucknumber + "', '" + row.ponumber + "','" + row.requestdeliverydate + "','" + row.deliveryaddress + "','" + row.deliveryinstruction + "', '" + row.Volume + "','" + row.Pressure + "', " + row.SQ_Qty + "," + row.CurrencyId + "," + row.UnitPrice + "," + row.TotalPrice + "," + row.ConvertedPrice + "," + row.ConvertedCurrencyId + "," + row.ExchangeRate + "," + row.So_Issued_Qty + "," + row.Balance_Qty + ",1," + row.uomid + "   from tbl_packing_sodetail where packingid=" + row.packerheaderid + " and soid=" + row.soid + " ;";
                    }
                    else
                    {
                        sqdetailsql += "UPDATE  `tbl_packing_details` SET `isactive`=1, `pickqty` = " + row.pickqty + ",`drivername` = '" + row.drivername + "',`trucknumber` = '" + row.trucknumber + "', `Balance_Qty` = " + row.Balance_Qty + " WHERE `id` =" + row.id + " ;";
                    }


                }

                Result = await _connection.ExecuteAsync(sqdetailsql);
                Result = await _connection.ExecuteAsync("call proc_SalesOrder_Bal_Update(1,"+ insertedHeaderId + ") ");
                

                if (Result == 0)
                {
                    return new ResponseModel()
                    {
                        Data = null,
                        Message = "Update failed",
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
                            Message = "update Successfully",
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
                //Logger.Instance.Error("Exception:", Ex);
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
                 
                param.Add("@opt", 4);

                param.Add("@packing_id", Id);
                param.Add("@userid", 0);
                param.Add("@branchid", 0);

                param.Add("@sys_packnbr", 0);
                param.Add("@from_date", "");
                param.Add("@to_date", "");
                param.Add("@DOID", "");
                param.Add("@FilterGasCodeId", 0);

                param.Add("@filter_customerid", 0);
                param.Add("@filter_esttime", "0");
                param.Add("@filter_packerid", 0);
                var List = await _connection.QueryMultipleAsync(PackingAndDO.PackingAndDOProcedure, param: param, commandType: CommandType.StoredProcedure);
               

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


                        Modellist.Customers = nl;
                    }
                    else if (I == 2)
                    {


                        Modellist.SODtl = nl;
                    }
                    else if (I == 3)
                    {

                        Modellist.Details = nl;
                    }
                    else if (I == 4)
                    {

                        Modellist.GasDtl = nl;
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

        public async Task<object> UploadACK(int Id, string Path, string Filename,int userid)
        {
            int Result = 0;
            try
            {
                var Updatepacking = "update tbl_packing_header set ackfilename='"+Filename+"', ackfilepath='" + Path + "',isacknowledged=1,acknowledgementdate=now(),acknowledgedby="+ userid + " where id=" + Id+";";

                Updatepacking += "update tbl_packing_customerdetail set isacknowledged=1,acknowledgementdate=now(),acknowledgedby=" + userid + " where isactive=1 and packingid=" + Id + ";";
                Result = await _connection.ExecuteAsync(Updatepacking);
               
                return new ResponseModel()
                {
                    Data = null,
                    Message = "File Uploaded Successfully",
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

        public async Task<object> packingacknoledgement(List<packingacknowledgement> obj,Int32 UserId)
        {
            int Result = 0;
            try
            {
                string ackupdate = "";
                int packingid = 0;
                string dono = "";
                foreach (var row in obj)
                {
                    ackupdate +="update tbl_packing_customerdetail set isacknowledged=1,acknowledgementdate=now(),acknowledgedby=" + UserId + " where id=" + row.id+ " and ifnull(isacknowledged,0)=0; ";
                    packingid = row.packingid;
                    dono = row.DONo;


                }

                ackupdate += "update tbl_packing_header set isacknowledged=1 where id=" + packingid + " and ifnull(isacknowledged,0)=0; ";
                Result = await _connection.ExecuteAsync(ackupdate);

                    //var ReturnOrder = "UPDATE master_cylinder c join tbl_returnorder_details rtn on c.cylinderid = rtn.cylinderid and rtn.isactive = 1 set c.statusid = 3,c.location='BTG',  c.isdelivered=0  where rtn.Rtn_ID = " + insertedHeaderId + ";";
                var ReturnOrder = $@"UPDATE master_cylinder AS c
                                    INNER JOIN tbl_packing_deliverydetail AS tpd ON tpd.Barcode = c.Barcode
                                    INNER JOIN tbl_packing_customerdetail AS tpcd ON tpcd.id = tpd.customerdtlid
                                    SET c.statusid = 2
                                    WHERE tpd.packingid = {packingid} AND tpcd.DONo = '{dono}' AND IFNULL(tpd.isactive, 1) = 1;";
                Result = await _connection.ExecuteAsync(ReturnOrder);

                return new ResponseModel()
                {
                    Data = null,
                    Message = "Acknowledged Successfully",
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

            public async Task<object> GetInvoiceData(Int32 PackingId)
            {
                int Result = 0;
                try
                {
                var data = await _connection.QueryAsync(
        "CALL Proc_PackingAndDO(7, " + PackingId + ", 0, 0, 0, '', '', '', 0, 0, '0', 0);"
    );
                //var param = new DynamicParameters();
                //param.Add("opt", 7);


                //param.Add("packing_id", PackingId);
                //param.Add("@userid", 0);
                //param.Add("@branchid", 0);

                //param.Add("@sys_packnbr", 0);
                //param.Add("@from_date", "");
                //param.Add("@to_date", "");
                //param.Add("@DOID", "");
                //param.Add("@FilterGasCodeId", 0);

                //param.Add("@filter_customerid", 0);
                //param.Add("@filter_esttime", "0");
                //param.Add("@filter_packerid", 0);

                //var data = await _connection.QueryAsync(PackingAndDO.PackingAndDOProcedure, param: param, commandType: CommandType.StoredProcedure);

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

        public async Task<bool> IsDogenerated(int packid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 5);


                param.Add("@packing_id", packid);
                param.Add("@userid", 0);
                param.Add("@branchid", 0);

                param.Add("@sys_packnbr", 0);
                param.Add("@from_date", "");
                param.Add("@to_date", "");
                param.Add("@DOID", "");
                param.Add("@FilterGasCodeId", 0);

                param.Add("@filter_customerid", 0);
                param.Add("@filter_esttime", "0");
                param.Add("@filter_packerid", 0);

                var data = await _connection.QueryAsync(PackingAndDO.PackingAndDOProcedure, param: param, commandType: CommandType.StoredProcedure);
                var list = data.Count();

                if (list > 0)
                {
                    return true;
                }
                else
                {
                    return false;
                }

            }
            catch (Exception Ex)
            {

                return false;
            }
        }

        public async Task<object> GetAllExportAsync(Int32 packerid, string from_date, string to_date, Int32 BranchId, Int32 GasCodeId, int customerid, string esttime, int packer_id)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 6);

                param.Add("@packing_id", packerid);
                param.Add("@userid", 0);
                param.Add("@branchid", BranchId);

                param.Add("@sys_packnbr", 0);
                param.Add("@from_date", from_date);
                param.Add("@to_date", to_date);
                param.Add("@DOID", "");
                param.Add("@FilterGasCodeId", GasCodeId);
                param.Add("@filter_customerid", customerid);
                param.Add("@filter_esttime", esttime);
                param.Add("@filter_packerid", packer_id);



                var List = await _connection.QueryAsync(PackingAndDO.PackingAndDOProcedure, param: param, commandType: CommandType.StoredProcedure);
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
        #region ChangePackingStage
        public async Task<object> ChangePackingStage(int packingPersonId, int stageId, int branchId)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@PackingId", packingPersonId);
                param.Add("@StageId", stageId);
                param.Add("@BranchId", branchId);

                var result = await _connection.QueryFirstOrDefaultAsync<int>(PackingAndDO.PackingChangePackingStage,
                    param,
                    commandType: CommandType.StoredProcedure
                );

                return new
                {
                    Status = result == 0,
                    Message = result == 0 ? "Packing stage updated successfully." : "Packing record not found.",
                    StatusCode = result == 0 ? 200 : 404
                };
            }
            catch (Exception ex)
            {
                return new
                {
                    Status = false,
                    Message = $"Exception: {ex.Message}",
                    StatusCode = 500
                };
            }
        }
        #endregion


        public async Task<object> GenerateInvoice(Int32 PackingId, string DOID)
        {
            int Result = 0;
            try
            {
                var param = new DynamicParameters();
                param.Add("@Opt", 8);


                param.Add("@packing_id", PackingId);
                param.Add("@userid", 1);
                param.Add("@branchid", 0);

                param.Add("@sys_packnbr", 0);
                param.Add("@from_date", "");
                param.Add("@to_date", "");

                param.Add("@DOID", DOID);
                param.Add("@FilterGasCodeId", 0);

                param.Add("@filter_customerid", 0);
                param.Add("@filter_esttime", "0");
                param.Add("@filter_packerid", 0);

                var data = await _connection.QueryFirstOrDefaultAsync<int>(PackingAndDO.PackingAndDOProcedure, param: param, commandType: CommandType.StoredProcedure);
                if (data > 0)
                {
                    return new ResponseModel()
                    {
                        Data = data,
                        Message = "Invoice Generated Succefully",
                        Status = true
                    };
                }
                else
                {
                    return new ResponseModel()
                    {
                        Data = data,
                        Message = "Invoice Not Generated Please Fill UnitPrice In Quotation ",
                        Status = false
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

        public async Task<object> BarcodeMachineScan(Int32 PackingId,Int32 UserId)
        {
            int Result = 0;
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 3);


                param.Add("@packingid", PackingId);
                param.Add("@barcode", 0);
                param.Add("@BarcodeDtlid", 0);

                param.Add("@UserId", UserId);

                param.Add("@doid", 0);
                param.Add("@rackid", 0);

                var data = await _connection.ExecuteAsync(OrderMngMaster.BarcodeProcedure, param: param, commandType: CommandType.StoredProcedure);
                if (data > 0)
                {
                    return new ResponseModel()
                    {
                        Data = data,
                        Message = "DO Generated Succefully",
                        Status = true
                    };
                }
                else
                {
                    return new ResponseModel()
                    {
                        Data = data,
                        Message = "Error Occured",
                        Status = false
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

        public async Task<object> PackingConfirmed(Int32 PackingId, Int32 UserId,int rackid)
        {
            int Result = 0;
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 4);


                param.Add("@packingid", PackingId);
                param.Add("@barcode", 0);
                param.Add("@BarcodeDtlid", 0);

                param.Add("@UserId", UserId);
                param.Add("@doid", 0);
                param.Add("@rackid", rackid);

                var data = await _connection.ExecuteAsync(OrderMngMaster.BarcodeProcedure, param: param, commandType: CommandType.StoredProcedure);
                if (data > 0)
                {
                    return new ResponseModel()
                    {
                        Data = data,
                        Message = "Saved Succefully",
                        Status = true
                    };
                }
                else
                {
                    return new ResponseModel()
                    {
                        Data = data,
                        Message = "Error Occured",
                        Status = false
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

        public async Task<object> docprint(Int32 doid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 1);

                param.Add("@doid", doid);



                var List = await _connection.QueryAsync(PackingAndDO.docprint, param: param, commandType: CommandType.StoredProcedure);
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