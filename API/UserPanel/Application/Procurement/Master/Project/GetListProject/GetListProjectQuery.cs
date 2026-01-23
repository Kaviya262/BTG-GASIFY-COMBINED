using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Master.Project.GetListProject
{
    public class GetListProjectQuery : IRequest<object>
    {
        public string projectcode {get; set;}
        public string projectname {get; set;}
        public int userid { get; set;}
        public int branchid { get; set; }
        public int orgid { get; set; }
    }
}
