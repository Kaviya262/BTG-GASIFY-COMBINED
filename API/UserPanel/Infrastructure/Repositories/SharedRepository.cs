using System;
using System.Collections.Generic;
using System.Data;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BackEnd.Invoices;
using BackEnd.Shared;
using Core.Models;
using Core.OrderMng.Invoices;
using Core.OrderMng.Quotation;
using Core.OrderMng.SaleOrder;
using Dapper;
using MediatR;
using UserPanel.Infrastructure.Data;


namespace Infrastructure.Repositories
{
    public class SharedRepository 
    {

        private readonly IDbConnection _connection;
        string IPAddress = "";
        public SharedRepository(IDbConnection connectionFactory)
        {
            _connection = connectionFactory;
        }


     

        public async Task<SharedModelWithResponse> GetSeqNumber(int id,string text,int type, int unit,int orgid)
        {

            try
            {
                var param = new DynamicParameters();
                param.Add("@opt", 1);
                param.Add("@id", id);
                param.Add("@text", text);
                param.Add("@type", type);
                param.Add("@branchid", unit);
                param.Add("@orgid", orgid);
                 

                var data = await _connection.QueryFirstOrDefaultAsync<SharedModel>(Shared.SharedProcedure, param: param, commandType: CommandType.StoredProcedure);



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



