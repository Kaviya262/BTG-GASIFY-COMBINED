using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace Application.Distribution.MasterSalesOrder.GetAll
{
    public class GetAllMasterSalesOrderCommand : IRequest<object>
    {
        public int OrgId { get; set; }
        public int SearchBy { get; set; }
        public int? CustomerId { get; set; }
        public int? GasCodeId { get; set; }
        public int? BranchId { get; set; }
    }
}
