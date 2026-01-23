using BackEnd.FinanceModule.Revenue;
using BackEnd.Master;
using Core.Abstractions;
using Core.FinanceModule.Report;
using Core.FinanceModule.Revenue;
using Core.Models;
using Dapper;
using DocumentFormat.OpenXml.Presentation;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class FinanceReportRepository: IFinanceReportRepository
    {

        private readonly IDbConnection _connection;

        public FinanceReportRepository(IUnitOfWorkDB3 financeDb)
        {
            _connection = financeDb.Connection;
        }

        public async Task<object> LedgerReport(string p_FromDate,string p_ToDate,int branchid,int orgid,int SlCodeId)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 1);
                param.Add("@p_FromDate", p_FromDate);
                param.Add("@p_ToDate", p_ToDate);
                param.Add("@orgid", orgid);
                param.Add("@orgid", branchid);
                param.Add("@SlCodeId", SlCodeId);


                var result = await _connection.QueryFirstOrDefaultAsync<object>(
                    Common.TrailBalance, param, commandType: CommandType.StoredProcedure);

                return new ResponseModel
                {
                    Data = result,
                    Message = "Revenue updated successfully",
                    Status = true
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Data = null,
                    Message = "Error updating Revenue: " + ex.Message,
                    Status = false
                };
            }
        }


        public async Task<object> LedgerDetails(int SlCodeId, int branchid, int orgid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 2);
                param.Add("@p_FromDate", "");
                param.Add("@p_ToDate","");
                param.Add("@orgid", orgid);
                param.Add("@orgid", branchid);
                param.Add("@SlCodeId", SlCodeId);



                var result = await _connection.QueryFirstOrDefaultAsync<object>(
                    Common.TrailBalance, param, commandType: CommandType.StoredProcedure);

                return new ResponseModel
                {
                    Data = result,
                    Message = "Revenue updated successfully",
                    Status = true
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Data = null,
                    Message = "Error updating Revenue: " + ex.Message,
                    Status = false
                };
            }
        }


        public async Task<object> SalesReport(int orgid, string Fromdate, string Todate, int customerid, int gasid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@p_orgid", orgid);
                param.Add("@p_FromDate", Fromdate);
                param.Add("@p_ToDate", Todate);
                param.Add("@p_CustomerId", customerid);
                param.Add("@p_GasId", gasid);



                var result = await _connection.QueryAsync<object>(
                    Common.SalesReport, param, commandType: CommandType.StoredProcedure);
                 
                var Modellist = result.ToList();
                return new ResponseModel
                {
                    Data = Modellist,
                    Message = "successfully",
                    Status = true
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Data = null,
                    Message = "Error in Sales Report",
                    Status = false
                };
            }


        }

        public async Task<object> ProfitAndLossReport(int orgid, string Fromdate, string Todate,int currencyid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@p_orgid", orgid);
                param.Add("@from_date", Fromdate);
                param.Add("@to_date", Todate);
                param.Add("@p_currencyid", currencyid);
            



                var result = await _connection.QueryAsync<object>(
                    Common.ProfitAndLossReport, param, commandType: CommandType.StoredProcedure);

                var Modellist = result.ToList();
                return new ResponseModel
                {
                    Data = Modellist,
                    Message = "successfully",
                    Status = true
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Data = null,
                    Message = "Error in Profit And Loss Report",
                    Status = false
                };
            }


        }

    }
}
