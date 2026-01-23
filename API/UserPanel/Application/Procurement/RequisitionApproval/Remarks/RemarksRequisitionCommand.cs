using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace Application.Procurement.RequisitionApproval.Remarks
{
    public class RemarksRequisitionCommand : IRequest<object>
    {
        public Int32 prid { get; set; }
    }
}
