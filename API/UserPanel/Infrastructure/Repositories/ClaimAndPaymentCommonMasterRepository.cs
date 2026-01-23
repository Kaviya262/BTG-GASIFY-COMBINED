using Application.Procurement.Master.Common;
using BackEnd.Finance;
using BackEnd.Master;
using BackEnd.Procurement;
using Core.Abstractions;
using Core.Finance.Master;
using Core.Models;
using Core.Procurement.Master;
using Dapper;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class ClaimAndPaymentCommonMasterRepository : IClaimAndPaymentCommonMasterRepository
    {
        private readonly IDbConnection _connection;

        public ClaimAndPaymentCommonMasterRepository(IUnitOfWorkDB3 unitOfWork)
        {
            _connection = unitOfWork.Connection;
        }

        public async Task<object> GetCategoryDetails(Int32 id, Int32 branchid, string Searchtext, Int32 orgid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 4);
                param.Add("@branchid", branchid);
                param.Add("@searchtext", Searchtext);
                param.Add("@pmid", 0);
                param.Add("@prid", 0);
                param.Add("@orgid", orgid);
                param.Add("@id", id);
                param.Add("@categoryid", 0);
                param.Add("@claimtype_id", 0);
                param.Add("@supplier_id", 0);
                var List = await _connection.QueryAsync(ClaimAndPaymentMasterDB.ClaimAndPayment, param: param, commandType: CommandType.StoredProcedure);
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
        public async Task<object> GetDepartMentDetails(Int32 id, Int32 branchid, string Searchtext, Int32 orgid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 2);
                param.Add("@branchid", branchid);
                param.Add("@searchtext", Searchtext);
                param.Add("@pmid", 0);
                param.Add("@prid", 0);
                param.Add("@orgid", orgid);
                param.Add("@id", id);
                param.Add("@categoryid", 0);
                param.Add("@claimtype_id", 0);
                param.Add("@supplier_id", 0);
                var List = await _connection.QueryAsync(ClaimAndPaymentMasterDB.ClaimAndPayment, param: param, commandType: CommandType.StoredProcedure);
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
        public async Task<object> GetApplicantDetails(Int32 id, Int32 branchid, string Searchtext, Int32 orgid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 1);
                param.Add("@branchid", branchid);
                param.Add("@searchtext", Searchtext);
                param.Add("@pmid", 0);
                param.Add("@prid", 0);
                param.Add("@orgid", orgid);
                param.Add("@id", id);
                param.Add("@categoryid", 0);
                param.Add("@claimtype_id", 0);
                param.Add("@supplier_id", 0);
                var List = await _connection.QueryAsync(ClaimAndPaymentMasterDB.ClaimAndPayment, param: param, commandType: CommandType.StoredProcedure);
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
        public async Task<object> GetTransactionCurrency(Int32 id, Int32 branchid, string Searchtext, Int32 orgid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 3);
                param.Add("@branchid", branchid);
                param.Add("@searchtext", Searchtext);
                param.Add("@pmid", 0);
                param.Add("@prid", 0);
                param.Add("@orgid", orgid);
                param.Add("@id", id);
                param.Add("@categoryid", 0);
                param.Add("@claimtype_id", 0);
                param.Add("@supplier_id", 0);
                var List = await _connection.QueryAsync(ClaimAndPaymentMasterDB.ClaimAndPayment, param: param, commandType: CommandType.StoredProcedure);
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
        public async Task<object> GetClaimType(Int32 id, Int32 branchid, string Searchtext, Int32 orgid, Int32 categoryid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 5);
                param.Add("@branchid", branchid);
                param.Add("@searchtext", Searchtext);
                param.Add("@pmid", 0);
                param.Add("@prid", 0);
                param.Add("@orgid", orgid);
                param.Add("@id", id);
                param.Add("@categoryid", categoryid);
                param.Add("@claimtype_id", 0);
                param.Add("@supplier_id", 0);
                var List = await _connection.QueryAsync(ClaimAndPaymentMasterDB.ClaimAndPayment, param: param, commandType: CommandType.StoredProcedure);
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

        public async Task<object> GetPaymentDescription(Int32 id, Int32 branchid, string Searchtext, Int32 orgid, Int32 claimtypeid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 6);
                param.Add("@branchid", branchid);
                param.Add("@searchtext", Searchtext);
                param.Add("@pmid", 0);
                param.Add("@prid", 0);
                param.Add("@orgid", orgid);
                param.Add("@id", id);
                param.Add("@categoryid", 0);
                param.Add("@claimtype_id", claimtypeid);
                param.Add("@supplier_id", 0);
                var List = await _connection.QueryAsync(ClaimAndPaymentMasterDB.ClaimAndPayment, param: param, commandType: CommandType.StoredProcedure);
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

        public async Task<object> GetSupplierList(Int32 id, Int32 branchid, string Searchtext, Int32 orgid, Int32 claimtypeid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 7);
                param.Add("@branchid", branchid);
                param.Add("@searchtext", Searchtext);
                param.Add("@pmid", 0);
                param.Add("@prid", 0);
                param.Add("@orgid", orgid);
                param.Add("@id", id);
                param.Add("@categoryid", 0);
                param.Add("@claimtype_id", claimtypeid);
                param.Add("@supplier_id", 0);
                var List = await _connection.QueryAsync(ClaimAndPaymentMasterDB.ClaimAndPayment, param: param, commandType: CommandType.StoredProcedure);
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
        public async Task<object> GetAllClaimList(Int32 id, Int32 branchid, string Searchtext, Int32 orgid, Int32 claimtypeid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 8);
                param.Add("@branchid", branchid);
                param.Add("@searchtext", Searchtext);
                param.Add("@pmid", 0);
                param.Add("@prid", 0);
                param.Add("@orgid", orgid);
                param.Add("@id", id);
                param.Add("@categoryid", 0);
                param.Add("@claimtype_id", 0);
                param.Add("@supplier_id", 0);
                

                var List = await _connection.QueryAsync(ClaimAndPaymentMasterDB.ClaimAndPayment, param: param, commandType: CommandType.StoredProcedure);
                var Modellist = List.ToList();
                // Attach PaymentNo (PPP) from tbl_PaymentSummary_header when SummaryId is present
                try
                {
                    var summaryIds = new List<int>();
                    foreach (var item in Modellist)
                    {
                        if (item is IDictionary<string, object> dict && dict.ContainsKey("SummaryId") && dict["SummaryId"] != null)
                        {
                            if (int.TryParse(dict["SummaryId"].ToString(), out var sid))
                                summaryIds.Add(sid);
                        }
                    }

                    if (summaryIds.Any())
                    {
                        var idsCsv = string.Join(',', summaryIds.Distinct());
                        var sql = $"SELECT SummaryId, PaymentNo FROM tbl_PaymentSummary_header WHERE SummaryId IN ({idsCsv}) AND Isactive = 1";
                        var payments = await _connection.QueryAsync(sql);
                        var paymentDict = new Dictionary<int, string>();
                        foreach (var p in payments)
                        {
                            var pd = p as IDictionary<string, object>;
                            if (pd != null && pd.ContainsKey("SummaryId") && pd.ContainsKey("PaymentNo") && pd["SummaryId"] != null)
                            {
                                if (int.TryParse(pd["SummaryId"].ToString(), out var sid))
                                {
                                    paymentDict[sid] = pd["PaymentNo"]?.ToString();
                                }
                            }
                        }

                        // add PaymentNo property to each result item if available
                        foreach (var item in Modellist)
                        {
                            if (item is IDictionary<string, object> dict && dict.ContainsKey("SummaryId") && dict["SummaryId"] != null)
                            {
                                if (int.TryParse(dict["SummaryId"].ToString(), out var sid) && paymentDict.TryGetValue(sid, out var pno))
                                {
                                    // add or overwrite PaymentNo property
                                    if (dict.ContainsKey("PaymentNo"))
                                        dict["PaymentNo"] = pno;
                                    else
                                        dict.Add("PaymentNo", pno);
                                }
                            }
                        }
                    }
                }
                catch { /* swallow secondary errors to avoid breaking main result */ }
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

        public async Task<object> GetPOList(Int32 id, Int32 branchid, string Searchtext, Int32 orgid, Int32 supplierid)
        {
            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 9);
                param.Add("@branchid", branchid);
                param.Add("@searchtext", Searchtext);
                param.Add("@pmid", 0);
                param.Add("@prid", 0);
                param.Add("@orgid", orgid);
                param.Add("@id", id);
                param.Add("@categoryid", 0);
                param.Add("@claimtype_id", 0);
                param.Add("@supplier_id", supplierid);


                var List = await _connection.QueryAsync(ClaimAndPaymentMasterDB.ClaimAndPayment, param: param, commandType: CommandType.StoredProcedure);
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
