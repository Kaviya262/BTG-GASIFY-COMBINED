using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace Application.AccessRights.GetMenusDetails
{
    public class GetMenusDetailsCommand : IRequest<object>
    {
        public int id { get; set; }
        public int userid { get; set; }
        public int orgid { get; set; }
        public Int32 branchId { get; set; }
        public Int32 screenid { get; set; }
    }
}
