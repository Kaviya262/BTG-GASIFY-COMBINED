using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Models;
using Core.OrderMng.PackingAndDO;
using Core.Shared;
using MediatR;
using UserPanel.Application.Quotation.GetQuotationItem;

namespace Application.PackingAndDO.UploadPackingAndDO
{
    public class UploadPackingAndDOQueryHandler : IRequestHandler<UploadPackingAndDOQuery, ResponseModel>
    {
        ExcellSheet ES = new ExcellSheet();
        private readonly IPackingAndDORepository _repository;
         
        public UploadPackingAndDOQueryHandler(IPackingAndDORepository repository)
        {
            _repository = repository;
        }


        public async Task<ResponseModel> Handle(UploadPackingAndDOQuery query, CancellationToken cancellationToken)
        {
            try
            {
                var data = ES.LoadExcelDataIntoDataSet(query.Path);
                int IsEmpty = 0; int IsDuplicate = 0;
                foreach (DataTable dt in data.Tables)
                {
                    foreach (DataRow row in dt.Rows)
                    {
                        object value = row["BarCode"];
                        if (value == null || value == "" || value.ToString().Trim() == "" || value == DBNull.Value)
                        {
                            IsEmpty = 1;
                            break;
                        }
                    }
                    if (IsEmpty == 1)
                    {
                        break;
                    }


                    var duplicates = dt.AsEnumerable()
                .GroupBy(row => row["BarCode"].ToString().Trim())
                .Where(g => g.Count() > 1)
                .Select(g => g.Key)
                .ToList();

                    if (duplicates.Count() > 0)
                    {
                        IsDuplicate = 1;
                        break;
                    }

                }
               

                if (IsEmpty == 1)
                {

                    return new ResponseModel
                    {
                        Data = "",
                        Message = "Some of the data is missing. Please check the file.",
                        Status = false

                    };
                }
               else if (IsDuplicate == 1)
                {
                    return new ResponseModel
                    {
                        Data = "",
                        Message = "Duplicate Barcode Exists.",
                        Status = false

                    };
                }
                else if (data.Tables[0].Rows.Count > 0)
                {

                    var Result = await _repository.UploadDO(query.Id, query.Path, data);
                    return Result;
                }
                else
                {
                    return new ResponseModel
                    {
                        Data = "",
                        Message = "Incorrect file",
                        Status = false

                    };
                }
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Data = "",
                    Message = "Incorrect file",
                    Status = false

                };
            }
          
           
            
        }
    }


}