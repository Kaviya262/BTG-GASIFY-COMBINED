using Core.Procurement.Master;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Master.Project.UpdateProject
{
    public class UpdateProjectCommand : IRequest<object>
    {
        public MasterProject Project { get; set; }
    }
}
