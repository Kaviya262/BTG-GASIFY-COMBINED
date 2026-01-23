using Core.Abstractions;
using Core.Finance_new;
using Core.Models;
using Dapper;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class AccountsReceivableRepository : IAccountsReceivableRepository
    {
        private readonly IDbConnection _connection;
        public AccountsReceivableRepository(IUnitOfWorkDB3 financedb)
        {
            _connection = financedb.Connection;
        }

        public async Task<object> InsertFromInvoiceAsync(int orgId, int branchId, int userId, string userIp,int invoiceId,int typeid)
        {
            try
            {
                var p = new DynamicParameters();
                p.Add("@opt", 1);
                p.Add("@orgid", orgId);
                p.Add("@branchid", branchId);
                p.Add("@user_id", userId);
                p.Add("@user_ip", userIp);
                p.Add("@in_receipts", "[]"); // not used
                p.Add("@invoiceid", invoiceId);
                p.Add("@customer_id", 0);
                p.Add("@currency_id", 0);
                p.Add("@type_id", typeid);

                await _connection.ExecuteAsync("proc_accounts_receivable",p, commandType: CommandType.StoredProcedure);

                return new ResponseModel
                {
                    Data = null,
                    Message = "Accounts receivable inserted successfully.",
                    Status = true
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Data = null,
                    Message = "Error inserting accounts receivable: " + ex.Message,
                    Status = false
                };
            }
        }

        public async Task<object> UpdateReceiptsAsync(int orgId, int branchId, int userId, string userIp, IEnumerable<ArReceiptInput> receipts)
        {
            try
            {
                // You must ensure receipt_id is 0 (or not used) for first-time insert
                foreach (var r in receipts)
                {
                    r.receipt_id = 0; // ignore it on insert
                }

                string json = JsonSerializer.Serialize(receipts);

                var p = new DynamicParameters();
                p.Add("@opt", 2);
                p.Add("@orgid", orgId);
                p.Add("@branchid", branchId);
                p.Add("@user_id", userId);
                p.Add("@user_ip", userIp);
                p.Add("@in_receipts", json);
                p.Add("@invoiceid", 0);
                p.Add("@customer_id", 0);
                p.Add("@currency_id", 0);
                await _connection.ExecuteAsync("proc_accounts_receivable",
                                               p, commandType: CommandType.StoredProcedure);

                return new ResponseModel
                {
                    Data = null,
                    Message = "Receipts updated successfully.",
                    Status = true
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Data = null,
                    Message = "Error updating receipts: " + ex.Message,
                    Status = false
                };
            }
        }

        public async Task<object> GetByCustomerAsync(int orgId, int branchId,int? customerId = null)
        {
            try
            {
                string filterJson = customerId.HasValue
                    ? JsonSerializer.Serialize(new { customer_id = customerId.Value })
                    : "{}";

                var p = new DynamicParameters();
                p.Add("@opt", 3);
                p.Add("@orgid", orgId);
                p.Add("@branchid", branchId);
                p.Add("@user_id", 0);
                p.Add("@user_ip", "");
                p.Add("@in_receipts", filterJson);
                p.Add("@invoiceid", 0);
                p.Add("@customer_id", customerId ?? 0);
                p.Add("@currency_id", 0);
                p.Add("@type_id", 0);
                var list = await _connection.QueryAsync(
                    "proc_accounts_receivable",
                    p,
                    commandType: CommandType.StoredProcedure);

                return new ResponseModel
                {
                    Data = list,
                    Message = "Success",
                    Status = true
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Data = null,
                    Message = "Error retrieving accounts receivable: " + ex.Message,
                    Status = false
                };
            }
        }

        public async Task<object> getARBook(int orgId, int branchId, int? customerId = null,DateTime? from_date = null,DateTime? to_date = null)
        {
            try
            {
            
                var p = new DynamicParameters();
    
                p.Add("@p_orgid", orgId);
                p.Add("@p_branchid", branchId);
                p.Add("@p_from_date", from_date.HasValue ? (object)from_date.Value : DBNull.Value);
                p.Add("@p_to_date", to_date.HasValue ? (object)to_date.Value : DBNull.Value);
                p.Add("@p_customer_id", customerId ?? 0);

                var list = await _connection.QueryAsync("proc_ar_book", p, commandType: CommandType.StoredProcedure);

                return new ResponseModel
                {
                    Data = list,
                    Message = "Success",
                    Status = true
                };
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Data = null,
                    Message = "Error retrieving accounts receivable: " + ex.Message,
                    Status = false
                };
            }
        }
    }
}
