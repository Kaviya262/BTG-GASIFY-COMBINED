using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.AccessRights;
using MediatR;

namespace Application.AccessRights.Roledropdown
{
    public class RoledropdownCommand : IRequest<object>
    {
        public int BranchId { get; set; }
        public int OrgId { get; set; }
    }
}
