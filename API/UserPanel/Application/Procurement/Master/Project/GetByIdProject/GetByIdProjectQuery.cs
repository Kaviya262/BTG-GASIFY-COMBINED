using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Master.Project.GetByIdProject
{
    public class GetByIdProjectQuery : IRequest<object>
    {
        public int projectid { get; set; }
        public int branchid { get; set; }
        public int orgid { get; set; }
    }
}
