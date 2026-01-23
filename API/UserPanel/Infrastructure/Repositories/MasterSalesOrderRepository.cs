using System.Data;
using BackEnd.Shared;
using Core.Abstractions;
using Core.Models;
using Core.OrderMng.Distribution.MasterSalesOrders;
using Core.OrderMng.PackingAndDO;
using Dapper;

namespace Infrastructure.Repositories
{
    public class MasterSalesOrderRepository : IMasterSalesOrderRepository
    {
        private readonly IDbConnection _connection;

        public MasterSalesOrderRepository(IUnitOfWorkDB1 unitOfWork)
        {
            _connection = unitOfWork.Connection;
        }

        public async Task<object> GetAll(int? searchBy, int? customerId, int? gasCodeId, int? branchId)
        {
            try
            {
                var parameters = new DynamicParameters();

                parameters.Add("p_searchBy", searchBy == 0 ? (int?)null : searchBy);
                parameters.Add("p_customerId", customerId == 0 ? (int?)null : customerId);
                parameters.Add("p_gasCodeId", gasCodeId == 0 ? (int?)null : gasCodeId);
                parameters.Add("p_branchId", branchId == 0 ? (int?)null : branchId);


                var list = await _connection.QueryAsync(
                    "GetPostedSalesOrders",
                    parameters,
                    commandType: CommandType.StoredProcedure);

                var modelList = list.ToList();

                return new ResponseModel
                {
                    Data = modelList,
                    Message = "Success",
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
        //public async Task<object> AddAsync(PackingAndDOItems Obj)
        //{
        //    try
        //    {
        //        int Result = 0;
        //        int insertedHeaderId = 0;
        //        string message = "";

        //        // --- HANDLE SEQUENCE NUMBER (if needed) ---
        //        var response = await GetSeqNumberOrder(0, Obj.Header.PackNo, 6, Obj.Header.BranchId, Obj.Header.OrgId);
        //        if (response.Status == true && response.Data.result == 1)
        //        {
        //            message = $" - Order number {Obj.Header.PackNo} is taken, new number {response.Data.text} generated.";
        //            Obj.Header.PackNo = response.Data.text;
        //        }

        //        // Normalize nullable fields
        //        if (Obj.Header.packingpersonid <= 0) Obj.Header.packingpersonid = null;

        //        // --- INSERT OR UPDATE HEADER ---
        //        if (Obj.Header.id > 0)
        //        {
        //            // UPDATE existing header
        //            const string updateHeaderSql = @"
        //            UPDATE tbl_packing_header SET
        //                RackId = @RackId,
        //                RackNo = @RackNo,
        //                packingpersonid = @packingpersonid,
        //                pdldate = @pdldate,
        //                IsSubmitted = @IsSubmitted,
        //                OrgId = @OrgId,
        //                BranchId = @BranchId,
        //                esttime = @esttime,
        //                PackingType = @PackingType,
        //                DONo = @DONo,
        //                createdby = @UserId,
        //                CreatedDate = NOW(),
        //                CreatedIP = ''
        //            WHERE id = @id";

        //            await _connection.ExecuteAsync(updateHeaderSql, Obj.Header);
        //            insertedHeaderId = Obj.Header.id;

        //            // Delete existing details to replace them with updated/new details
        //            await _connection.ExecuteAsync("DELETE FROM tbl_packing_customerdetail WHERE packingid = @id", new { id = insertedHeaderId });
        //            await _connection.ExecuteAsync("DELETE FROM tbl_packing_sodetail WHERE packingid = @id", new { id = insertedHeaderId });
        //            await _connection.ExecuteAsync("DELETE FROM tbl_packing_gasdetail WHERE packingid = @id", new { id = insertedHeaderId });
        //            await _connection.ExecuteAsync("DELETE FROM tbl_packing_details WHERE packerheaderid = @id", new { id = insertedHeaderId });
        //        }
        //        else
        //        {
        //            // INSERT new header
        //            const string insertHeaderSql = @"
        //            INSERT INTO tbl_packing_header
        //            (RackId, RackNo, packingpersonid, pdldate, isactive, IsSubmitted, OrgId, BranchId, createdby, CreatedDate, CreatedIP, PackNo, DONo, esttime, PackingType)
        //            VALUES
        //            (@RackId, @RackNo, @packingpersonid, @pdldate, 1, @IsSubmitted, @OrgId, @BranchId, @UserId, NOW(), '', @PackNo, 0, @esttime, @PackingType);";

        //            await _connection.ExecuteAsync(insertHeaderSql, Obj.Header);
        //            insertedHeaderId = await _connection.QuerySingleAsync<int>("SELECT LAST_INSERT_ID();");
        //        }

        //        // --- INSERT CUSTOMER DETAILS ---
        //        if (Obj.Customers != null && Obj.Customers.Count > 0)
        //        {
        //            var customerSql = new StringBuilder();
        //            foreach (var cust in Obj.Customers)
        //            {
        //                cust.PackingId = insertedHeaderId;
        //                customerSql.Append($@"
        //                INSERT INTO tbl_packing_customerdetail
        //                (packingid, customerid, isactive, createdby, CreatedDate, CreatedIP, customername)
        //                VALUES
        //                ({cust.PackingId},{cust.CustomerId},1,{Obj.Header.UserId},NOW(),'','{cust.CustomerName?.Replace("'", "''") ?? ""}');");
        //            }
        //            await _connection.ExecuteAsync(customerSql.ToString());
        //        }

        //        // --- INSERT SO DETAILS ---
        //        if (Obj.SODtl != null && Obj.SODtl.Count > 0)
        //        {
        //            var soSql = new StringBuilder();
        //            foreach (var so in Obj.SODtl)
        //            {
        //                so.PackingId = insertedHeaderId;
        //                soSql.Append($@"
        //                INSERT INTO tbl_packing_sodetail
        //                (packingid, customerid, soid, isactive, createdby, CreatedDate, CreatedIP, Customerdtlid, SoNum)
        //                SELECT {so.PackingId}, {so.CustomerId}, {so.SOID}, 1, {Obj.Header.UserId}, NOW(), '', id, '{so.SoNum?.Replace("'", "''") ?? ""}'
        //                FROM tbl_packing_customerdetail
        //                WHERE isactive = 1 AND customerid = {so.CustomerId} AND packingid = {so.PackingId};");
        //            }
        //            await _connection.ExecuteAsync(soSql.ToString());
        //        }

        //        // --- INSERT GAS DETAILS ---
        //        if (Obj.GasDtl != null && Obj.GasDtl.Count > 0)
        //        {
        //            var gasSql = new StringBuilder();
        //            foreach (var gas in Obj.GasDtl)
        //            {
        //                gas.PackingId = insertedHeaderId;
        //                gasSql.Append($@"
        //                INSERT INTO tbl_packing_gasdetail
        //                (packingid, customerid, gascodeid, isactive, createdby, CreatedDate, CreatedIP, Customerdtlid, GasName, GasCode, GasId)
        //                SELECT {gas.PackingId}, {gas.CustomerId}, {gas.gascodeid}, 1, {Obj.Header.UserId}, NOW(), '', id, '{gas.GasName?.Replace("'", "''") ?? ""}', '{gas.GasCode?.Replace("'", "''") ?? ""}', {gas.GasId ?? 0}
        //                FROM tbl_packing_customerdetail
        //                WHERE isactive = 1 AND customerid = {gas.CustomerId} AND packingid = {gas.PackingId};");
        //            }
        //            await _connection.ExecuteAsync(gasSql.ToString());
        //        }

        //        // --- INSERT OR UPDATE PACKING DETAILS ---
        //        if (Obj.Details != null && Obj.Details.Count > 0)
        //        {
        //            var detailSql = new StringBuilder();

        //            foreach (var det in Obj.Details)
        //            {
        //                det.packerheaderid = insertedHeaderId;

        //                if (det.id > 0)
        //                {
        //                    // UPDATE existing detail
        //                    string updateSql = @"
        //    UPDATE tbl_packing_details SET
        //        SQID = @SQID,
        //        packerheaderid = @packerheaderid,
        //        sodetailid = (SELECT id FROM tbl_packing_sodetail WHERE packingid = @packerheaderid AND soid = @soid LIMIT 1),
        //        gascodeid = @gascodeid,
        //        soqty = @soqty,
        //        pickqty = @pickqty,
        //        drivername = @drivername,
        //        trucknumber = @trucknumber,
        //        ponumber = @ponumber,
        //        requestdeliverydate = @requestdeliverydate,
        //        deliveryaddress = @deliveryaddress,
        //        deliveryinstruction = @deliveryinstruction,
        //        Volume = @Volume,
        //        Pressure = @Pressure,
        //        SQ_Qty = @SQ_Qty,
        //        CurrencyId = @CurrencyId,
        //        UnitPrice = @UnitPrice,
        //        TotalPrice = @TotalPrice,
        //        ConvertedPrice = @ConvertedPrice,
        //        ConvertedCurrencyId = @ConvertedCurrencyId,
        //        ExchangeRate = @ExchangeRate,
        //        So_Issued_Qty = @So_Issued_Qty,
        //        Balance_Qty = @Balance_Qty,
        //        isactive = 1,
        //        uomid = @uomid,
        //        packing_gas_detailid = (SELECT id FROM tbl_packing_gasdetail WHERE packingid = @packerheaderid AND gascodeid = @gascodeid LIMIT 1),
        //        SeqTime = @SeqTime,
        //        DriverId = @DriverId,
        //        TruckId = @TruckId,
        //        PackerName = @PackerName,
        //        PackerId = @PackerId,
        //        GasName = @GasName,
        //        GasCode = @GasCode,
        //        GasId = @GasId
        //    WHERE id = @id;
        //";

        //                    await _connection.ExecuteAsync(updateSql, new
        //                    {
        //                        det.SQID,
        //                        det.packerheaderid,
        //                        det.soid,
        //                        det.gascodeid,
        //                        det.soqty,
        //                        det.pickqty,
        //                        drivername = det.drivername ?? "",
        //                        trucknumber = det.trucknumber ?? "",
        //                        ponumber = det.ponumber ?? "",
        //                        requestdeliverydate = string.IsNullOrWhiteSpace(det.requestdeliverydate) ? (DateTime?)null : DateTime.Parse(det.requestdeliverydate),
        //                        deliveryaddress = det.deliveryaddress ?? "",
        //                        deliveryinstruction = det.deliveryinstruction ?? "",
        //                        Volume = det.Volume ?? "0",
        //                        Pressure = det.Pressure ?? "0",
        //                        det.SQ_Qty,
        //                        det.CurrencyId,
        //                        UnitPrice = det.UnitPrice ?? 0m,
        //                        TotalPrice = det.TotalPrice ?? 0m,
        //                        ConvertedPrice = det.ConvertedPrice ?? 0m,
        //                        det.ConvertedCurrencyId,
        //                        ExchangeRate = det.ExchangeRate ?? 0m,
        //                        So_Issued_Qty = det.So_Issued_Qty ?? 0m,
        //                        Balance_Qty = det.Balance_Qty ?? 0m,
        //                        det.uomid,
        //                        det.packerheaderid,
        //                        det.gascodeid,
        //                        SeqTime = det.SeqTime?.ToString(@"hh\:mm\:ss") ?? "00:00:00",
        //                        det.DriverId,
        //                        det.TruckId,
        //                        PackerName = det.PackerName ?? "",
        //                        det.PackerId,
        //                        GasName = det.GasName ?? "",
        //                        GasCode = det.GasCode ?? "",
        //                        det.GasId,
        //                        det.id
        //                    });
        //                }
        //                else
        //                {
        //                    // INSERT new detail
        //                    string insertSql = @"
        //    INSERT INTO tbl_packing_details
        //    (SQID, packerheaderid, sodetailid, gascodeid, soqty, pickqty,
        //     drivername, trucknumber, ponumber, requestdeliverydate, deliveryaddress, deliveryinstruction,
        //     Volume, Pressure, SQ_Qty, CurrencyId, UnitPrice, TotalPrice, ConvertedPrice,
        //     ConvertedCurrencyId, ExchangeRate, So_Issued_Qty, Balance_Qty, isactive, uomid, packing_gas_detailid,
        //     SeqTime, DriverId, TruckId, PackerName, PackerId, GasName, GasCode, GasId)
        //    SELECT
        //        @SQID,
        //        @packerheaderid,
        //        a.id,
        //        @gascodeid,
        //        @soqty,
        //        @pickqty,
        //        @drivername,
        //        @trucknumber,
        //        @ponumber,
        //        @requestdeliverydate,
        //        @deliveryaddress,
        //        @deliveryinstruction,
        //        @Volume,
        //        @Pressure,
        //        @SQ_Qty,
        //        @CurrencyId,
        //        @UnitPrice,
        //        @TotalPrice,
        //        @ConvertedPrice,
        //        @ConvertedCurrencyId,
        //        @ExchangeRate,
        //        @So_Issued_Qty,
        //        @Balance_Qty,
        //        1,
        //        @uomid,
        //        b.id,
        //        @SeqTime,
        //        @DriverId,
        //        @TruckId,
        //        @PackerName,
        //        @PackerId,
        //        @GasName,
        //        @GasCode,
        //        @GasId
        //    FROM tbl_packing_sodetail AS a
        //    LEFT JOIN tbl_packing_gasdetail AS b
        //        ON b.customerid = a.customerid
        //        AND b.packingid = @packerheaderid
        //        AND b.gascodeid = @gascodeid
        //    WHERE a.packingid = @packerheaderid AND a.soid = @soid;
        //";

        //                    await _connection.ExecuteAsync(insertSql, new
        //                    {
        //                        det.SQID,
        //                        det.packerheaderid,
        //                        det.soid,
        //                        det.gascodeid,
        //                        det.soqty,
        //                        det.pickqty,
        //                        drivername = det.drivername ?? "",
        //                        trucknumber = det.trucknumber ?? "",
        //                        ponumber = det.ponumber ?? "",
        //                        requestdeliverydate = string.IsNullOrWhiteSpace(det.requestdeliverydate) ? (DateTime?)null : DateTime.Parse(det.requestdeliverydate),
        //                        deliveryaddress = det.deliveryaddress ?? "",
        //                        deliveryinstruction = det.deliveryinstruction ?? "",
        //                        Volume = det.Volume ?? "0",
        //                        Pressure = det.Pressure ?? "0",
        //                        det.SQ_Qty,
        //                        det.CurrencyId,
        //                        UnitPrice = det.UnitPrice ?? 0m,
        //                        TotalPrice = det.TotalPrice ?? 0m,
        //                        ConvertedPrice = det.ConvertedPrice ?? 0m,
        //                        det.ConvertedCurrencyId,
        //                        ExchangeRate = det.ExchangeRate ?? 0m,
        //                        So_Issued_Qty = det.So_Issued_Qty ?? 0m,
        //                        Balance_Qty = det.Balance_Qty ?? 0m,
        //                        det.uomid,
        //                        det.packerheaderid,
        //                        det.gascodeid,
        //                        SeqTime = det.SeqTime?.ToString(@"hh\:mm\:ss") ?? "00:00:00",
        //                        det.DriverId,
        //                        det.TruckId,
        //                        PackerName = det.PackerName ?? "",
        //                        det.PackerId,
        //                        GasName = det.GasName ?? "",
        //                        GasCode = det.GasCode ?? "",
        //                        det.GasId
        //                    });
        //                }
        //            }
        //            await _connection.ExecuteAsync(detailSql.ToString());
        //        }

        //        // --- Update Document Number & Post Processing ---
        //        int branchId = Obj.Header.BranchId;
        //        var updateSeqSql = $"UPDATE master_documentnumber SET Doc_Number = Doc_Number + 1 WHERE Doc_Type = 6 AND unit = {branchId}; CALL proc_SalesOrder_Bal_Update(1, {insertedHeaderId});";
        //        await _connection.ExecuteAsync(updateSeqSql);

        //        return new ResponseModel()
        //        {
        //            Data = Obj.Header.PackNo,
        //            Message = (Obj.Header.IsSubmitted == 0 ? "Saved Successfully" : "Posted Successfully") + message,
        //            Status = true
        //        };
        //    }
        //    catch (Exception ex)
        //    {
        //        // Log exception here if needed
        //        return new ResponseModel()
        //        {
        //            Data = null,
        //            Message = "Something went wrong: " + ex.Message,
        //            Status = false
        //        };
        //    }
        //}

        public async Task<object> AddAsync(PackingAndDOItems Obj)
        {
            try
            {
                int IsValidated = 0;
                string Message = "";
                Int32 Result = 0;
                SharedRepository SR = new SharedRepository(_connection);


                if (Obj.Header.packingpersonid <= 0)
                {
                    Obj.Header.packingpersonid = null;
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
                    // Added customername field here
                    customersql += $@"INSERT INTO `tbl_packing_customerdetail`(`packingid`,`customerid`,`isactive`,`createdby`,`CreatedDate`,`CreatedIP`, `customername`)
                                      VALUES ({row.PackingId},{row.CustomerId},1,{Obj.Header.UserId},now(),'','{row.CustomerName ?? ""}'); ";
                }
                Result = await _connection.ExecuteAsync(customersql);

                string PackingSOsql = "";
                if (Obj.SODtl != null)
                {
                    var uniqueSOs = Obj.SODtl
        .GroupBy(x => x.SOID)
        .Select(g => g.First());

                    foreach (var row in uniqueSOs)
                    {
                        row.PackingId = insertedHeaderId;
                        var exists = await _connection.QueryFirstOrDefaultAsync<int?>(
            "SELECT 1 FROM tbl_packing_sodetail WHERE packingid = @PackingId AND soid = @SOID",
            new { row.PackingId, row.SOID });

                        if (exists == null)
                        {
                            // Added SoNum here
                            PackingSOsql += $@"INSERT INTO `tbl_packing_sodetail`(`packingid`,`customerid`,`soid`,`isactive`,`createdby`,`CreatedDate`,`CreatedIP`, `Customerdtlid`, `SoNum`)
                                           select {row.PackingId},{row.CustomerId},{row.SOID},1,{Obj.Header.UserId},now(),'',id, '{row.SoNum ?? ""}' 
                                           from tbl_packing_customerdetail 
                                           where isactive=1 and customerid={row.CustomerId} and packingid={row.PackingId};";
                        }
                    }
                    if (!string.IsNullOrEmpty(PackingSOsql))
                        await _connection.ExecuteAsync(PackingSOsql);
                }

                string PackingGassql = "";
                if (Obj.GasDtl != null)
                {
                    foreach (var row in Obj.GasDtl)
                    {
                        // CHECK IF ALREADY EXISTS
                        //var exists = await _connection.QueryFirstOrDefaultAsync<int?>(
                        //    "SELECT 1 FROM tbl_packing_gasdetail WHERE packingid = @PackingId AND customerid = @CustomerId AND gascodeid = @gascodeid",
                        //    new { row.PackingId, row.CustomerId, row.gascodeid });

                        //if (exists == null)
                        //{
                            row.PackingId = insertedHeaderId;
                            // Added GasName, GasCode, GasId
                            PackingGassql += $@"INSERT INTO `tbl_packing_gasdetail`(`packingid`,`customerid`,`gascodeid`,`isactive`,`createdby`,`CreatedDate`,`CreatedIP`, `Customerdtlid`, `GasName`, `GasCode`, `GasId`)
                                            select {row.PackingId},{row.CustomerId},{row.gascodeid},1,{Obj.Header.UserId},now(),'',id, '{row.GasName ?? ""}', '{row.GasCode ?? ""}', {row.GasId ?? 0}
                                            from tbl_packing_customerdetail 
                                            where isactive=1 and customerid={row.CustomerId} and packingid={row.PackingId};";
                        //}
                    }
                    if (!string.IsNullOrEmpty(PackingGassql))
                        Result = await _connection.ExecuteAsync(PackingGassql);
                }

                Result = insertedHeaderId;
                string sqdetailsql = "";

                foreach (var row in Obj.Details)
                {
                    row.packerheaderid = insertedHeaderId;

                    // Helper to format date or return NULL (without quotes)
                    string FormatDateForSql(string dateStr)
                    {
                        if (DateTime.TryParse(dateStr, out DateTime dt))
                            return $"'{dt:yyyy-MM-dd}'";
                        else
                            return "NULL";
                    }

                    // For nullable ints that are NOT NULL in DB, insert 0 if null
                    string SqlOrZeroInt(int? value)
                    {
                        return value.HasValue ? value.Value.ToString() : "0";
                    }

                    // For nullable decimals that are NOT NULL in DB, insert 0 if null
                    string SqlOrZeroDecimal(decimal? value)
                    {
                        return value.HasValue ? value.Value.ToString(System.Globalization.CultureInfo.InvariantCulture) : "0";
                    }

                    // For nullable ints that allow NULL in DB
                    string SqlOrNullInt(int? value)
                    {
                        return value.HasValue ? value.Value.ToString() : "NULL";
                    }

                    // For nullable decimals that allow NULL in DB
                    string SqlOrNullDecimal(decimal? value)
                    {
                        return value.HasValue ? value.Value.ToString(System.Globalization.CultureInfo.InvariantCulture) : "NULL";
                    }

                    // For strings, escape single quotes and use empty string if null
                    string SqlOrDefault(string value, string defaultVal)
                    {
                        return string.IsNullOrEmpty(value) ? defaultVal : value.Replace("'", "''");
                    }

                    sqdetailsql += $@"
INSERT INTO `tbl_packing_details` (
    `SQID`, `packerheaderid`, `sodetailid`, `gascodeid`, `soqty`, `pickqty`,
    `drivername`, `trucknumber`, `ponumber`, `requestdeliverydate`, `deliveryaddress`, `deliveryinstruction`,
    `Volume`, `Pressure`, `SQ_Qty`, `CurrencyId`, `UnitPrice`, `TotalPrice`, `ConvertedPrice`,
    `ConvertedCurrencyId`, `ExchangeRate`, `So_Issued_Qty`, `Balance_Qty`, `isactive`, `uomid`, `packing_gas_detailid`,
    `SeqTime`, `DriverId`, `TruckId`, `PackerName`, `PackerId`, `GasName`, `GasCode`, `GasId`
)
SELECT
    {row.SQID},
    {row.packerheaderid},
    a.id,
    {SqlOrZeroInt(row.gascodeid)},
    {row.soqty},
    {row.pickqty},
    '{SqlOrDefault(row.drivername, "")}',
    '{SqlOrDefault(row.trucknumber, "")}',
    '{SqlOrDefault(row.ponumber, "")}',
    {FormatDateForSql(row.requestdeliverydate)},
    '{SqlOrDefault(row.deliveryaddress, "")}',
    '{SqlOrDefault(row.deliveryinstruction, "")}',
    '{SqlOrDefault(row.Volume, "0")}',
    '{SqlOrDefault(row.Pressure, "0")}',
    {SqlOrZeroDecimal(row.SQ_Qty)},
    {SqlOrZeroInt(row.CurrencyId)},
    {SqlOrZeroDecimal(row.UnitPrice)},
    {SqlOrZeroDecimal(row.TotalPrice)},
    {SqlOrZeroDecimal(row.ConvertedPrice)},
    {SqlOrZeroInt(row.ConvertedCurrencyId)},
    {SqlOrZeroDecimal(row.ExchangeRate)},
    {SqlOrZeroDecimal(row.So_Issued_Qty)},
    {SqlOrZeroDecimal(row.Balance_Qty)},
    1,
    2,
    (SELECT id FROM tbl_packing_gasdetail 
     WHERE packingid = {row.packerheaderid} 
       AND customerid = a.customerid 
       AND gascodeid = {SqlOrZeroInt(row.gascodeid)} 
     LIMIT 1) AS packing_gas_detailid,
    '{row.SeqTime?.ToString(@"hh\:mm\:ss") ?? "00:00:00"}',
    {SqlOrNullInt(row.DriverId)},
    {SqlOrNullInt(row.TruckId)},
    '{SqlOrDefault(row.PackerName, "")}',
    {SqlOrNullInt(row.PackerId)},
    (SELECT GasName FROM tbl_packing_gasdetail 
     WHERE packingid = {row.packerheaderid} 
       AND customerid = a.customerid 
       AND gascodeid = {SqlOrZeroInt(row.gascodeid)} 
     LIMIT 1),
    (SELECT GasCode FROM tbl_packing_gasdetail 
     WHERE packingid = {row.packerheaderid} 
       AND customerid = a.customerid 
       AND gascodeid = {SqlOrZeroInt(row.gascodeid)} 
     LIMIT 1),
    (SELECT GasId FROM tbl_packing_gasdetail 
     WHERE packingid = {row.packerheaderid} 
       AND customerid = a.customerid 
       AND gascodeid = {SqlOrZeroInt(row.gascodeid)} 
     LIMIT 1)
FROM tbl_packing_sodetail AS a
WHERE a.packingid = {row.packerheaderid} 
  AND a.soid = {row.soid}
  AND EXISTS (
      SELECT 1 FROM tbl_packing_gasdetail g 
      WHERE g.packingid = {row.packerheaderid}
        AND g.customerid = a.customerid
        AND g.gascodeid = {SqlOrZeroInt(row.gascodeid)}
  );
";
                }

                // Execute the combined SQL:
                Result = await _connection.ExecuteAsync(sqdetailsql);

                if (Obj.Header.IsSubmitted == 1 && Obj.Details != null)
                {
                    string SqlOrZeroDecimal(decimal? value)
                    {
                        return value.HasValue
                            ? value.Value.ToString(System.Globalization.CultureInfo.InvariantCulture)
                            : "0";
                    }

                    string updateSalesOrderSql = "";

                    if (Obj.Header.IsSubmitted == 1 && Obj.Details != null)
                    {
                        foreach (var row in Obj.Details)
                        {
                            var sql = @"
            UPDATE tbl_salesorder_details
            SET 
                so_Issued_Qty = COALESCE(so_Issued_Qty, 0) + @PickQty,
                bal_to_issue = COALESCE(bal_to_issue, 0) + @BalanceQty
            WHERE Sqdtlid = @SQID AND GasID = @gascodeid;";

                            await _connection.ExecuteAsync(sql, new
                            {
                                PickQty = row.pickqty,
                                BalanceQty = row.Balance_Qty,
                                SQID = row.SQID,
                                gascodeid = row.gascodeid
                            });
                        }
                    }
                }


                if (Obj.Header.IsSubmitted == 1 && Obj.Details != null)
                {
                    int BranchId = Obj.Header.BranchId;
                    var UpdateSeq = $"update master_documentnumber set Doc_Number=Doc_Number+1 where Doc_Type=6 and unit={BranchId}; call proc_SalesOrder_Bal_Update(1,{insertedHeaderId}) ";
                    Result = await _connection.ExecuteAsync(UpdateSeq, BranchId);
                    Result = 1;
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
        public async Task<object> UpdateAsync(PackingAndDOItems Obj)
        {
            try
            {
                int Result = 0;
                string Message = "";
                SharedRepository SR = new SharedRepository(_connection);

                var response = await GetSeqNumberOrder(0, Obj.Header.PackNo, 6, Obj.Header.BranchId, Obj.Header.OrgId, Obj.Header.IsSubmitted);
                if (response.Status == true && response.Data != null && response.Data.result == 1)
                {
                    Message = $" - The current order number {Obj.Header.PackNo} is taken. A new order number ({response.Data.text}) was generated.";
                    Obj.Header.PackNo = response.Data.text;
                }

                if (Obj.Header.packingpersonid <= 0)
                    Obj.Header.packingpersonid = null;

                if (Obj.Header.id == 0 && Obj.Header.IsSubmitted == 0)
                {
                    var existingHeaderId = await _connection.QueryFirstOrDefaultAsync<int?>(@"
                SELECT id FROM tbl_packing_header
                WHERE BranchId = @BranchId AND pdldate = @Date AND IsActive = 1 AND IsSubmitted = 1
                LIMIT 1", new { Obj.Header.BranchId, Date = Obj.Header.pdldate });

                    if (existingHeaderId != null)
                    {
                        Obj.Header.id = existingHeaderId.Value;
                        Message += " - Reused existing posted record.";
                    }
                }

             
                if (Obj.Header.id == 0)
                {
                    const string insertHeaderSql = @"
                INSERT INTO tbl_packing_header
                (RackId, RackNo, packingpersonid, pdldate, isactive, IsSubmitted, OrgId, BranchId, createdby, CreatedDate, CreatedIP, PackNo, DONo, esttime, PackingType)
                VALUES (@RackId, @RackNo, @packingpersonid, @pdldate, 1, @IsSubmitted, @OrgId, @BranchId, @UserId, now(), '', @PackNo, 0, @esttime, @PackingType);
                SELECT LAST_INSERT_ID();";

                    Obj.Header.id = await _connection.ExecuteScalarAsync<int>(insertHeaderSql, Obj.Header);

                    //int BranchId = Obj.Header.BranchId;
                    //var UpdateSeq = $"update master_documentnumber set Doc_Number=Doc_Number+1 where Doc_Type=6 and unit={BranchId};";
                    //Result = await _connection.ExecuteAsync(UpdateSeq, BranchId);
                    //Result = 1;
                }
                else
                {
                    const string updateHeaderSql = @"
                UPDATE tbl_packing_header SET
                    RackId = @RackId,
                    RackNo = @RackNo,
                    packingpersonid = @packingpersonid,
                    pdldate = @pdldate,
                    IsSubmitted = @IsSubmitted,
                    OrgId = @OrgId,
                    BranchId = @BranchId,
                    updatedby = @UserId,
                    LastModifiedDate = NOW(),
                    LastModifiedIP = '1.1.1.1',
                    PackNo = @PackNo,
                    esttime = @esttime,
                    PackingType = @PackingType
                WHERE id = @id;";
                    Result = await _connection.ExecuteAsync(updateHeaderSql, Obj.Header);

                    //int BranchId = Obj.Header.BranchId;
                    //var UpdateSeq = $"update master_documentnumber set Doc_Number=Doc_Number+1 where Doc_Type=6 and unit={BranchId};";
                    //Result = await _connection.ExecuteAsync(UpdateSeq, BranchId);
                    //Result = 1;
                }

                // 🔁 Upsert Customer Details
                foreach (var customer in Obj.Customers)
                {
                    customer.PackingId = Obj.Header.id;

                    if (customer.id == 0)
                    {
                        const string insertCustomerSql = @"
                    INSERT INTO tbl_packing_customerdetail
                    (packingid, customerid, isactive, createdby, CreatedDate, CreatedIP, customername)
                    VALUES (@PackingId, @CustomerId, 1, @UserId, now(), '', @CustomerName);";

                        await _connection.ExecuteAsync(insertCustomerSql, new
                        {
                            customer.PackingId,
                            customer.CustomerId,
                            UserId = Obj.Header.UserId,
                            customer.CustomerName
                        });
                    }
                    else
                    {
                        const string updateCustomerSql = @"
                    UPDATE tbl_packing_customerdetail SET
                        customername = @CustomerName,
                        updatedby = 1,
                        LastModifiedDate = NOW(),
                        LastModifiedIP = '1.1.1.1'
                    WHERE id = @id;";
                        await _connection.ExecuteAsync(updateCustomerSql, new { customer.CustomerName, customer.id });
                    }
                }

                // 🔁 Upsert Sales Order Details
                if (Obj.SODtl != null)
                {
                    foreach (var sodetail in Obj.SODtl)
                    {
                        sodetail.PackingId = Obj.Header.id;

                        if (sodetail.id == 0)
                        {
                            const string insertSODtlSql = @"
                        INSERT INTO tbl_packing_sodetail
                        (packingid, customerid, soid, isactive, createdby, CreatedDate, CreatedIP, Customerdtlid, SoNum)
                        SELECT @PackingId, @CustomerId, @SOID, 1, @UserId, now(), '', id, @SoNum
                        FROM tbl_packing_customerdetail
                        WHERE isactive = 1 AND customerid = @CustomerId AND packingid = @PackingId;";

                            await _connection.ExecuteAsync(insertSODtlSql, new
                            {
                                sodetail.PackingId,
                                sodetail.CustomerId,
                                sodetail.SOID,
                                UserId = Obj.Header.UserId,
                                sodetail.SoNum
                            });
                        }
                        else
                        {
                            const string updateSODtlSql = @"
                        UPDATE tbl_packing_sodetail SET
                            SoNum = @SoNum,
                            updatedby = 1,
                            LastModifiedDate = NOW(),
                            LastModifiedIP = '1.1.1.1'
                        WHERE id = @id;";
                            await _connection.ExecuteAsync(updateSODtlSql, new { sodetail.SoNum, sodetail.id });
                        }
                    }
                }

                // 🔁 Upsert Gas Details
                if (Obj.GasDtl != null)
                {
                    foreach (var gas in Obj.GasDtl)
                    {
                        gas.PackingId = Obj.Header.id;

                        if (gas.id == 0)
                        {
                            const string insertGasSql = @"
                        INSERT INTO tbl_packing_gasdetail
                        (packingid, customerid, gascodeid, isactive, createdby, CreatedDate, CreatedIP, Customerdtlid, GasName, GasCode, GasId)
                        SELECT @PackingId, @CustomerId, @gascodeid, 1, @UserId, now(), '', id, @GasName, @GasCode, @GasId
                        FROM tbl_packing_customerdetail
                        WHERE isactive = 1 AND customerid = @CustomerId AND packingid = @PackingId;";

                            await _connection.ExecuteAsync(insertGasSql, new
                            {
                                gas.PackingId,
                                gas.CustomerId,
                                gas.gascodeid,
                                UserId = Obj.Header.UserId,
                                gas.GasName,
                                gas.GasCode,
                                gas.GasId
                            });
                        }
                        else
                        {
                            const string updateGasSql = @"
                        UPDATE tbl_packing_gasdetail SET
                            GasName = @GasName,
                            GasCode = @GasCode,
                            GasId = @GasId,
                            LastModifiedDate = NOW(),
                            LastModifiedIP = '1.1.1.1'
                        WHERE id = @id;";
                            await _connection.ExecuteAsync(updateGasSql, gas);
                        }
                    }
                }

                // 🔁 Upsert Packing Details
                if (Obj.Details != null)
                {
                    foreach (var row in Obj.Details)
                    {
                        row.packerheaderid = Obj.Header.id;

                        if (row.id == 0)
                        {
                            //    const string insertDetailsSql = @"
                            //INSERT INTO tbl_packing_details
                            //(SQID, packerheaderid, sodetailid, gascodeid, soqty, pickqty, drivername, trucknumber, ponumber,
                            //requestdeliverydate, deliveryaddress, deliveryinstruction, Volume, Pressure, SQ_Qty, CurrencyId,
                            //UnitPrice, TotalPrice, ConvertedPrice, ConvertedCurrencyId, ExchangeRate, So_Issued_Qty, Balance_Qty,
                            //isactive, uomid, packing_gas_detailid, SeqTime, DriverId, TruckId, PackerName, PackerId, GasName, GasCode, GasId,IsQtyMatched)
                            //VALUES
                            //(@SQID, @packerheaderid, @sodetailid, @gascodeid, @soqty, @pickqty, @drivername, @trucknumber, @ponumber,
                            //@requestdeliverydate, @deliveryaddress, @deliveryinstruction, @Volume, @Pressure, @SQ_Qty, @CurrencyId,
                            //@UnitPrice, @TotalPrice, @ConvertedPrice, @ConvertedCurrencyId, @ExchangeRate, @So_Issued_Qty, @Balance_Qty,
                            //1, @uomid, @packing_gas_detailid, @SeqTime, @DriverId, @TruckId, @PackerName, @PackerId, @GasName, @GasCode, @GasId,@IsQtyMatched);";
                            //    await _connection.ExecuteAsync(insertDetailsSql, row);

                            const string insertDetailsSql = @"
INSERT INTO tbl_packing_details (
    SQID, packerheaderid, sodetailid, gascodeid, soqty, pickqty, drivername, trucknumber,
    ponumber, requestdeliverydate, deliveryaddress, deliveryinstruction, Volume, Pressure,
    SQ_Qty, CurrencyId, UnitPrice, TotalPrice, ConvertedPrice, ConvertedCurrencyId, ExchangeRate,
    So_Issued_Qty, Balance_Qty, isactive, uomid, packing_gas_detailid, SeqTime, DriverId, TruckId,
    PackerName, PackerId, GasName, GasCode, GasId, IsQtyMatched
)
SELECT
    @SQID,
    @packerheaderid,
    a.id AS sodetailid,
    @gascodeid,
    @soqty,
    @pickqty,
    @drivername,
    @trucknumber,
    @ponumber,
    @requestdeliverydate,
    @deliveryaddress,
    @deliveryinstruction,
    @Volume,
    @Pressure,
    @SQ_Qty,
    @CurrencyId,
    @UnitPrice,
    @TotalPrice,
    @ConvertedPrice,
    @ConvertedCurrencyId,
    @ExchangeRate,
    @So_Issued_Qty,
    @Balance_Qty,
    1,
    2,
    g.id AS packing_gas_detailid,
    @SeqTime,
    @DriverId,
    @TruckId,
    @PackerName,
    @PackerId,
    g.GasName,
    g.GasCode,
    g.GasId,
    @IsQtyMatched
FROM tbl_packing_sodetail AS a
JOIN tbl_packing_gasdetail AS g 
    ON g.customerid = a.customerid 
    AND g.packingid = a.packingid 
    AND g.gascodeid = @gascodeid
WHERE a.packingid = @packerheaderid 
  AND a.soid = @soid and a.customerid=@customerId;
";
                            await _connection.ExecuteAsync(insertDetailsSql, row);

                        }
                        else
                        {
                            const string updateDetailsSql = @"
                        UPDATE tbl_packing_details SET
                            SQID = @SQID,
                            packerheaderid = @packerheaderid,
                            sodetailid = @sodetailid,
                            gascodeid = @gascodeid,
                            soqty = @soqty,
                            pickqty = @pickqty,
                            drivername = @drivername,
                            trucknumber = @trucknumber,
                            ponumber = @ponumber,
                            requestdeliverydate = @requestdeliverydate,
                            deliveryaddress = @deliveryaddress,
                            deliveryinstruction = @deliveryinstruction,
                            Volume = @Volume,
                            Pressure = @Pressure,
                            SQ_Qty = @SQ_Qty,
                            CurrencyId = @CurrencyId,
                            UnitPrice = @UnitPrice,
                            TotalPrice = @TotalPrice,
                            ConvertedPrice = @ConvertedPrice,
                            ConvertedCurrencyId = @ConvertedCurrencyId,
                            ExchangeRate = @ExchangeRate,
                            So_Issued_Qty = @So_Issued_Qty,
                            Balance_Qty = @Balance_Qty,
                            SeqTime = @SeqTime,
                            DriverId = @DriverId,
                            TruckId = @TruckId,
                            PackerName = @PackerName,
                            PackerId = @PackerId,
                            GasName = @GasName,
                            GasCode = @GasCode,
                            GasId = @GasId,
                            IsQtyMatched =@IsQtyMatched
                        WHERE id = @id;";
                            await _connection.ExecuteAsync(updateDetailsSql, row);
                        }
                    }
                }

                if (Obj.Header.IsSubmitted == 1 && Obj.Details != null)
                {
                    foreach (var row in Obj.Details)
                    {
                        // Use parameterized query — safe & clean
                        const string sql = @"
            UPDATE tbl_salesorder_details
            SET 
                so_Issued_Qty = COALESCE(so_Issued_Qty, 0) + @PickQty,
                bal_to_issue  = COALESCE(bal_to_issue, 0) + @BalanceQty
            WHERE Sqdtlid = @SQID AND GasID = @gascodeid;";

                        await _connection.ExecuteAsync(sql, new
                        {
                            PickQty = row.pickqty,
                            BalanceQty = row.Balance_Qty,
                            SQID = row.SQID,
                            gascodeid = row.gascodeid
                        });
                    }
                }

                if (Obj.Header.IsSubmitted == 1 && Obj.Details != null)
                {
                    int BranchId = Obj.Header.BranchId;
                    var UpdateSeq = $"update master_documentnumber set Doc_Number=Doc_Number+1 where Doc_Type=6 and unit={BranchId};";
                    Result = await _connection.ExecuteAsync(UpdateSeq, BranchId);
                    Result = 1;
                }

                // ✅ If submitted, trigger stock/qty update
                if (Obj.Header.IsSubmitted == 1)
                {
                    var updateSeq = "CALL proc_SalesOrder_Bal_Update(1, @Id)";
                    Result = await _connection.ExecuteAsync(updateSeq, new { Id = Obj.Header.id });
                }

                return new ResponseModel()
                {
                    Data = response.Data != null ? response.Data.text : null,
                    Message = (Obj.Header.IsSubmitted == 0 ? "Saved Successfully" : "Posted Successfully") + Message,
                    Status = true
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel()
                {
                    Data = null,
                    Message = "Something went wrong",
                    Status = false
                };
            }
        }


        public async Task<SharedModelWithResponse> GetSeqNumberOrder(int id, string text, int type, int unit, int orgid, int isSubmitted)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 1);
                param.Add("@id", 0);
                param.Add("@text", ""); // empty string, not null
                param.Add("@type", 6);
                param.Add("@branchid", 1);
                param.Add("@orgid", 1);

                SharedModel data = null;

                if (isSubmitted != 0)
                {
                    data = await _connection.QueryFirstOrDefaultAsync<SharedModel>(
                        Shared.SharedProcedure,
                        param: param,
                        commandType: CommandType.StoredProcedure
                    );
                }

                return new SharedModelWithResponse()
                {
                    Data = data,
                    Message = "Success",
                    Status = true
                };
            }
            catch (Exception Ex)
            {
                return new SharedModelWithResponse()
                {
                    Data = null,
                    Message = "Something went wrong",
                    Status = false
                };
            }
        }

    }


}

