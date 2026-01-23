using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;
using static Core.Master.Units.UnitsItem;

namespace Application.Master.Units.GetAllUnitsItem
{
    public class GetAllUnitsItemQuery : IRequest<object>
    {
        public UnitsItemHeader Header { get; set; }
       
        public string UnitsCode {  get; set; }

        public int BranchId { get; set; }
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }

    }
}
