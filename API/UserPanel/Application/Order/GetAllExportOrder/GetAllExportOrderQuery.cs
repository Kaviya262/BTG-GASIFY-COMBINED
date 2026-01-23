using Core.Shared;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Order.GetAllExportOrder
{
   public class GetAllExportOrderQuery : IRequest<ExcelSheetItems>
    {
        public int customerid { get; set; }
        public string from_date { get; set; }
        public string to_date { get; set; }
        public Int32 BranchId { get; set; }
        public string PO { get; set; }
        public Int32 FilterType { get; set; }


    }
}
