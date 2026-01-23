using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace Application.Financenew.AR.GetById
{
    public class GetByIdARCommand :IRequest<object>
    {
        public int orgId { get; set; }
        public int branchId { get; set; }
        public int customerid { get; set; }
         
    }
}
