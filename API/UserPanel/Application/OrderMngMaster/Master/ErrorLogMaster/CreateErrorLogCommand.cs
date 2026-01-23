using Core.Master.ErrorLog;
using Core.Master.Gas;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.OrderMngMaster.Master.ErrorLogMaster
{
    public class CreateErrorLogCommand : IRequest<object>
    {
        public ErrorLogMasterModel ErrorLog { get; set; }
    }
}
