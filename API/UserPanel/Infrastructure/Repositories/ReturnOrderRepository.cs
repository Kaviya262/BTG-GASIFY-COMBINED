using BackEnd.Invoices;
using BackEnd.ReturnOrder;
using Core.Abstractions;
using Core.Models;
using Core.ReturnOrder;
using Dapper;
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
    public class ReturnOrderRepository : IReturnOrderRepository
    {
        private readonly IDbConnection _connection;
        string IPAddress = "";
        public ReturnOrderRepository(IUnitOfWorkDB1 unitOfWork)
        {
            _connection = unitOfWork.Connection;
        }
        public async Task<object> AddAsync(ReturnOrderItem Obj)
        {
            try
            {

                int IsValidated = 0;
                string Message = "";
                Int32 Result = 0;
                SharedRepository SR = new SharedRepository(_connection);

                var response = await SR.GetSeqNumber(0, Obj.Header.rtnno, 7, Obj.Header.BranchId, Obj.Header.OrgId);
                if (response.Status == true)
                {
                    if (response.Data.result == 1)
                    {
                        IsValidated = 1;
                        Message = " - The current order number " + Obj.Header.rtnno + " is taken for another order so the new order number (" + response.Data.text + ") has been generated for this order";
                        Obj.Header.rtnno = response.Data.text;
                    }
                }

                 
                const string headerSql = @"
            INSERT INTO tbl_returnorder_header
            (RtndNo, RtnDate, CustomerId, CategoryId, CreatedDate, CreatedIP, IsActive, IsSubmitted, CreatedBy, BranchId, OrgId )
            VALUES (@rtnno, @rtndate, @customerid, @categoryid, now(), '',1,@issubmitted,@UserId,  @BranchId,  @OrgId );";


                await _connection.ExecuteAsync(headerSql, Obj.Header);


                const string getLastInsertedIdSql = "SELECT LAST_INSERT_ID();";
                var insertedHeaderId = await _connection.QuerySingleAsync<int>(getLastInsertedIdSql);


                var DOdata=Obj.Details.DistinctBy(u => u.DOID).ToList();
                var Gasdata = Obj.Details.DistinctBy(u => u.GasCodeId).ToList();
                string ReturnorderSql = "";
                if (Obj.Header.categoryid == 1)
                {
                    foreach (var row in Obj.GasDetail)
                {
                    row.Rtn_ID = insertedHeaderId;

                  
                        ReturnorderSql += @"
                INSERT INTO tbl_returnorder_gas
                (Rtn_ID, GasCodeId, CreatedBy, CreatedDate, CreatedIP, IsActive)
                VALUES 
                ("+ insertedHeaderId + ","+row.GasCodeId + "," + Obj.Header.UserId + " ,  NOW(),'',1);";

                  }

                }
                else
                {
                    foreach (var row in Gasdata)
                    {
                        row.Rtn_ID = insertedHeaderId;


                        ReturnorderSql += @"
                INSERT INTO tbl_returnorder_gas
                (Rtn_ID, GasCodeId, CreatedBy, CreatedDate, CreatedIP, IsActive)
                VALUES 
                ("+ insertedHeaderId + ","+row.GasCodeId + "," + Obj.Header.UserId + " ,  NOW(),'',1);";

                    }
                }

                if (Obj.Header.categoryid == 1)
                {
                    foreach (var row in Obj.DODetail)
                {
                    row.Rtn_ID = insertedHeaderId;


                    ReturnorderSql += @"
                INSERT INTO tbl_returnorder_dono
                (Rtn_ID, DOID, CreatedBy, CreatedDate, CreatedIP, IsActive)
                VALUES 
                ("+insertedHeaderId+", " + row.DOID+"," + Obj.Header.UserId + " ,  NOW(),'',1);";

                }

            }
                else
            {
                foreach (var row in Gasdata)
                {
                    row.Rtn_ID = insertedHeaderId;


                    ReturnorderSql += @"
                 INSERT INTO tbl_returnorder_dono
                (Rtn_ID, DOID, CreatedBy, CreatedDate, CreatedIP, IsActive)
                VALUES 
                (" + insertedHeaderId + "," + row.DOID + "," + Obj.Header.UserId + " ,  NOW(),'',1);";

                }
            }


            Result = await _connection.ExecuteAsync(ReturnorderSql);
                string detailSql = "";
                foreach (var row in Obj.Details)
                {

                        detailSql += @"
                             INSERT INTO tbl_returnorder_details
                             (DelDtlId,Rtn_ID, GasCodeId, PONumber, DOID, UOMID, Volume, Pressure, GasDescription, DeliveryAddressId, Address, DriverName, TruckName, IsActive, cylinderid, barcode, Rtn_Gas_ID, Rtn_DO_ID)
                             VALUES 
                             ("+row.DelDtlId + "," + insertedHeaderId+","+row.GasCodeId+ ",  '"+row.PONumber+ "', "+row.DOID+ ", "+row.UOMID+", '" + row.Volume + "', '" + row.Pressure + "', '" + row.GasDescription + "', " + row.DeliveryAddressId + ", '" + row.Address+ "', '" + row.DriverName + "', '" + row.TruckName + "', 1, " + row.cylinderid + ", '" + row.barcode + "', null,null);                           SELECT LAST_INSERT_ID();";

                    
                }

                Result = await _connection.ExecuteAsync(detailSql);

                var updateRtn = "UPDATE tbl_returnorder_details rtn left JOIN tbl_returnorder_dono AS don ON don.Rtn_ID = rtn.Rtn_ID and  don.DOID = rtn.DOID left JOIN tbl_returnorder_gas AS gas  ON rtn.Rtn_ID = gas.Rtn_ID and  gas.GasCodeId = rtn.GasCodeId set   rtn.Rtn_Gas_ID = gas.Rtn_Gas_ID,    rtn.Rtn_DO_ID = don.Rtn_DO_ID where rtn.Rtn_ID  = "+insertedHeaderId+";";
                Result = await _connection.ExecuteAsync(updateRtn );

                foreach (var doRow in Obj.DODetail)
                {
                    var checkQuery = @"
            SELECT tpdd.Barcode 
            FROM tbl_packing_customerdetail AS tpcd
            LEFT JOIN tbl_packing_deliverydetail AS tpdd 
                ON tpcd.id = tpdd.customerdtlid AND tpdd.isactive = 1
            LEFT JOIN tbl_returnorder_details AS rod 
                ON rod.DelDtlId = tpdd.id
            LEFT JOIN tbl_returnorder_header AS roh 
                ON roh.Rtn_ID = rod.Rtn_ID
            WHERE tpcd.id = @CustomerDtlId
              AND (rod.DelDtlId IS NULL OR IFNULL(roh.IsSubmitted, 0) = 0);";

                    var pendingList = await _connection.QueryAsync<string>(checkQuery, new { CustomerDtlId = doRow.DOID });

                    if (pendingList == null || !pendingList.Any())
                    {
                        var updateFlag = "UPDATE tbl_packing_customerdetail SET isDoRaised = 1 WHERE id = @CustomerDtlId;";
                        await _connection.ExecuteAsync(updateFlag, new { CustomerDtlId = doRow.DOID });
                    }
                }

                if (Obj.Header.issubmitted == 1)
                {
                    var ReturnOrder = "UPDATE master_cylinder c join tbl_returnorder_details rtn on c.cylinderid = rtn.cylinderid and rtn.isactive = 1 set c.statusid = 3,c.location='BTG', c.isdelivered=0  where rtn.Rtn_ID = " + insertedHeaderId + ";";
                    Result = await _connection.ExecuteAsync(ReturnOrder);
                }
                
                int BranchId = Obj.Header.BranchId;
                var updateSeq = "UPDATE master_documentnumber SET Doc_Number = Doc_Number + 1 WHERE Doc_Type = 7 AND Unit = @BranchId;";
                Result = await _connection.ExecuteAsync(updateSeq, new { BranchId });
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
                    if (Obj.Header.issubmitted == 0)
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
                            Message = "Posted Successfully"+ Message,
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
        public async Task<object> UpdateAsync(ReturnOrderItem Obj)
        {
            try
            {
                int Result = 0;

                  string headerSql = @"
            update tbl_returnorder_header set   CustomerId=@customerid, CategoryId=@categoryid,IsSubmitted=@issubmitted,LastModifiedDate=now(),LastModifiedIP='',LastModifiedBY=@UserId
             where Rtn_ID=@id;";
                headerSql += "update tbl_returnorder_gas set isactive=0 where Rtn_ID="+ Obj.Header.id + "; ";
                headerSql += "update tbl_returnorder_dono set isactive=0 where Rtn_ID=" + Obj.Header.id + "; ";

                await _connection.ExecuteAsync(headerSql, Obj.Header);
                 
                var insertedHeaderId =Obj.Header.id;


                var DOdata = Obj.Details.DistinctBy(u => u.DOID).ToList();
                var Gasdata = Obj.Details.DistinctBy(u => u.GasCodeId).ToList();
                string ReturnorderSql = "";
                if (Obj.Header.categoryid == 1)
                {
                    foreach (var row in Obj.GasDetail)
                    {
                        row.Rtn_ID = insertedHeaderId;

                        if (row.id == 0)
                        {
                            ReturnorderSql += @"
                INSERT INTO tbl_returnorder_gas
                (Rtn_ID, GasCodeId, CreatedBy, CreatedDate, CreatedIP, IsActive)
                VALUES 
                (" + insertedHeaderId + "," + row.GasCodeId + "," + Obj.Header.UserId + " ,  NOW(),'',1);";
                        }
                        else
                        {
                            ReturnorderSql += "update tbl_returnorder_gas set isactive=1 where Rtn_Gas_ID=" + row.id + "; ";
                        }
                    }

                }
                else
                {
                    foreach (var row in Gasdata)
                    {
                        row.Rtn_ID = insertedHeaderId;


                        ReturnorderSql += @"
                INSERT INTO tbl_returnorder_gas
                (Rtn_ID, GasCodeId, CreatedBy, CreatedDate, CreatedIP, IsActive)
           
               select  "+insertedHeaderId + "," + row.GasCodeId + "," + Obj.Header.UserId + " ,  NOW(),'',1  except select  Rtn_ID,GasCodeId,"+ Obj.Header.UserId + ",now(),'',1 from tbl_returnorder_gas where isactive=1 and  Rtn_ID=" + Obj.Header.id+"; ";

                    }
                }

                if (Obj.Header.categoryid == 1)
                {
                    foreach (var row in Obj.DODetail)
                    {
                        row.Rtn_ID = insertedHeaderId;

                        if (row.id == 0)
                        {
                            ReturnorderSql += @"
                INSERT INTO tbl_returnorder_dono
                (Rtn_ID, DOID, CreatedBy, CreatedDate, CreatedIP, IsActive)
                VALUES 
                (" + insertedHeaderId + ", " + row.DOID + "," + Obj.Header.UserId + " ,  NOW(),'',1);";

                        }
                        else
                        {
                            ReturnorderSql += "update tbl_returnorder_dono set isactive=1 where Rtn_DO_ID=" + row.id + "; ";
                        }

                    }
                }
                else
                {
                    foreach (var row in DOdata)
                    {
                        row.Rtn_ID = insertedHeaderId;


                        ReturnorderSql += @"
                 INSERT INTO tbl_returnorder_dono
                (Rtn_ID, DOID, CreatedBy, CreatedDate, CreatedIP, IsActive)
                   select  " + insertedHeaderId + "," + row.DOID + "," + Obj.Header.UserId + " ,  NOW(),'',1  except select  Rtn_ID,GasCodeId," + Obj.Header.UserId + ",now(),'',1 from tbl_returnorder_gas where isactive=1 and  Rtn_ID=" + Obj.Header.id + "; ";


                    }
                }
                ReturnorderSql += @" update tbl_returnorder_details set isactive=0 where Rtn_ID=" + Obj.Header.id + "; ";

                Result = await _connection.ExecuteAsync(ReturnorderSql);
                string detailSql = "";
                foreach (var row in Obj.Details)
                {
                    if (row.id == 0)
                    {
                        detailSql += @"
                             INSERT INTO tbl_returnorder_details
                             (DelDtlId,Rtn_ID, GasCodeId, PONumber, DOID, UOMID, Volume, Pressure, GasDescription, DeliveryAddressId, Address, DriverName, TruckName, IsActive, cylinderid, barcode, Rtn_Gas_ID, Rtn_DO_ID)
                             VALUES 
                             (" + row.DelDtlId + "," + insertedHeaderId + "," + row.GasCodeId + ",  '" + row.PONumber + "', " + row.DOID + ", " + row.UOMID + ", '" + row.Volume + "', '" + row.Pressure + "', '" + row.GasDescription + "', " + row.DeliveryAddressId + ", '" + row.Address + "', '" + row.DriverName + "', '" + row.TruckName + "', 1, " + row.cylinderid + ", '" + row.barcode + "', null,null);                           SELECT LAST_INSERT_ID();";
                    }
                    else
                    {
                        detailSql += @"update tbl_returnorder_details set isactive=1 where Rtn_Dtl_ID="+row.id+"; ";
                    }

                }

                Result = await _connection.ExecuteAsync(detailSql);




                var updateRtn = "UPDATE tbl_returnorder_details rtn left JOIN tbl_returnorder_dono AS don ON don.Rtn_ID = rtn.Rtn_ID and  don.DOID = rtn.DOID left JOIN tbl_returnorder_gas AS gas  ON rtn.Rtn_ID = gas.Rtn_ID and  gas.GasCodeId = rtn.GasCodeId set   rtn.Rtn_Gas_ID = gas.Rtn_Gas_ID,    rtn.Rtn_DO_ID = don.Rtn_DO_ID where rtn.Rtn_ID  = " + insertedHeaderId + ";";
                 
                Result = await _connection.ExecuteAsync(updateRtn);

                foreach (var doRow in Obj.DODetail)
                {
                    var checkQuery = @"
            SELECT tpdd.Barcode 
            FROM tbl_packing_customerdetail AS tpcd
            LEFT JOIN tbl_packing_deliverydetail AS tpdd 
                ON tpcd.id = tpdd.customerdtlid AND tpdd.isactive = 1
            LEFT JOIN tbl_returnorder_details AS rod 
                ON rod.DelDtlId = tpdd.id
            LEFT JOIN tbl_returnorder_header AS roh 
                ON roh.Rtn_ID = rod.Rtn_ID
            WHERE tpcd.id = @CustomerDtlId
              AND (rod.DelDtlId IS NULL OR IFNULL(roh.IsSubmitted, 0) = 0);";

                    var pendingList = await _connection.QueryAsync<string>(checkQuery, new { CustomerDtlId = doRow.DOID });

                    if (pendingList == null || !pendingList.Any())
                    {
                        var updateFlag = "UPDATE tbl_packing_customerdetail SET isDoRaised = 1 WHERE id = @CustomerDtlId;";
                        await _connection.ExecuteAsync(updateFlag, new { CustomerDtlId = doRow.DOID });
                    }
                }

                if (Obj.Header.issubmitted == 1)
                {
                    var ReturnOrder = "UPDATE master_cylinder c join tbl_returnorder_details rtn on c.cylinderid = rtn.cylinderid and rtn.isactive = 1 set c.statusid = 3,c.location='BTG',  c.isdelivered=0  where rtn.Rtn_ID = " + insertedHeaderId + ";";
                    Result = await _connection.ExecuteAsync(ReturnOrder);
                }

                if (Result == 0)
                {
                    return new ResponseModel()
                    {
                        Data = null,
                        Message = "update failed",
                        Status = false
                    };
                }
                else
                {
                    if (Obj.Header.issubmitted == 0)
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
                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went wrong",
                    Status = false
                };
            }
        }
        public async Task<object> GetAllAsync(Int32 customerid, string from_date, string to_date, Int32 BranchId, Int32 gascodeid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 1);
                param.Add("@order_id", 0);
                param.Add("@orgid", 0);
                param.Add("@branchid", BranchId);

                param.Add("@customerid", customerid);
                param.Add("@from_date", from_date);
                param.Add("@to_date", to_date);
                param.Add("@gascodeid", gascodeid);








                var List = await _connection.QueryAsync(ReturnOrder.ReturnOrderProcedure, param: param, commandType: CommandType.StoredProcedure);
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
        public async Task<object> GetByIdAsync(int ReturnOrderid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 2);

                 
                param.Add("@orgid", 0);
                param.Add("@branchid", 0);
                param.Add("@order_id", ReturnOrderid);


                param.Add("@customerid", 0);
                param.Add("@from_date", "");
                param.Add("@to_date", "");
                param.Add("@gascodeid", 0);






                var List = await _connection.QueryMultipleAsync(ReturnOrder.ReturnOrderProcedure, param: param, commandType: CommandType.StoredProcedure);
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


                        Modellist.DODetail = nl;
                    }
                    else if (I == 2)
                    {

                        Modellist.GasDetail = nl;
                    }
                    else if (I == 3)
                    {

                        Modellist.Details = nl;
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
        public async Task<object> GetProductionOrderSqNoQuery(int unit)
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
                param.Add("@gascodeid", 0);
                var data = await _connection.QueryFirstOrDefaultAsync(ReturnOrder.ReturnOrderProcedure, param: param, commandType: CommandType.StoredProcedure);



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
