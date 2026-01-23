using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace Application.Procurement.Master.CategoryTypes
{
    public class GetCategoryTypesQuery : IRequest<object>
    {
        public int branchid { get; set; }
        public int orgid { get; set; }
        public int typeid { get; set; }
    }
}
