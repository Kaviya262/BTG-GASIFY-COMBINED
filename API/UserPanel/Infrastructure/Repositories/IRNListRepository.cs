using BackEnd.Procurement.InvoiceReceipt;
using BackEnd.Procurement.PurchaseRequitision;
using Core.Abstractions;
using Core.Models;
using Core.Procurement.InvoiceReceipt;
using Dapper;
using System;
using System.Collections.Generic;
using System.Data;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class IRNListRepository : IIRNListRepository
    {
        private readonly IDbConnection _connection;
        string IPAddress = "";
        public IRNListRepository(IUnitOfWorkDB2 unitOfWork)
        {
            _connection = unitOfWork.Connection;
        }
        public async Task<object> GetAllIRNL(int branchid, int orgid, int supplierid,string fromdate,string todate,int irnid,int userid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 1);
                param.Add("@branchid", branchid);
                param.Add("@orgid", orgid);
                param.Add("@supplierid", supplierid);
                param.Add("@fromdate", fromdate);
                param.Add("@todate", todate);
                param.Add("@irnid", irnid);

                param.Add("@userid", userid);
                var List = await _connection.QueryAsync(InvoiceReceiptBackEnd.InvoiceReceiptList, param: param, commandType: CommandType.StoredProcedure);
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

        public async Task<object> GetAllSupplierIRNList(int branchid, int orgid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 2);
                param.Add("@branchid", branchid);
                param.Add("@orgid", orgid);
                param.Add("@supplierid", 0);
                param.Add("@fromdate", null,DbType.String);
                param.Add("@todate", null, DbType.String);
                param.Add("@irnid", 0);
                param.Add("@userid", 0);

                var List = await _connection.QueryAsync(InvoiceReceiptBackEnd.InvoiceReceiptList, param: param, commandType: CommandType.StoredProcedure);
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
        public async Task<object> getIRNById(int irnid, int branchid, int orgid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 3);
                param.Add("@branchid", branchid);
                param.Add("@orgid", orgid);
                param.Add("@supplierid", 0);
                param.Add("@fromdate", null, DbType.String);
                param.Add("@todate", null, DbType.String);
                param.Add("@irnid", irnid);
                param.Add("@userid", 0);

                //var List = await _connection.QueryAsync(InvoiceReceiptBackEnd.InvoiceReceiptList, param: param, commandType: CommandType.StoredProcedure);
                //var Modellist = List.ToList();
                var List = await _connection.QueryMultipleAsync(InvoiceReceiptBackEnd.InvoiceReceiptList, param: param, commandType: CommandType.StoredProcedure);
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
                        Modellist.Attachment = nl;
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




        public async Task<object> GetPaymentHistory(int branchid, int orgid, int supplierid, string fromdate, string todate)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 4);
                param.Add("@branchid", branchid);
                param.Add("@orgid", orgid);
                param.Add("@supplierid", supplierid);
                param.Add("@fromdate", fromdate);
                param.Add("@todate", todate);
                param.Add("@irnid", 0);

                param.Add("@userid", 0);
                var List = await _connection.QueryAsync(InvoiceReceiptBackEnd.InvoiceReceiptList, param: param, commandType: CommandType.StoredProcedure);
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
