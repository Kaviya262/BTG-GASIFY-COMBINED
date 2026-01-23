using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Master.Supplier.GetAllSupplier
{
    public class GetAllSupplierQuery : IRequest<object>
    {
     
        public int branchid { get; set; }
        public int orgid { get; set; }
        public int supplierid { get; set; }
        public int cityid { get; set; }
        public int stateid { get; set; }
        public int suppliercategoryid { get; set; }

    }
}
