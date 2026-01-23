using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Master.Claim;
using MediatR;

namespace Application.Procurement.Master.DescriptionStatusChange
{
    public class DescriptionStatusChangeQuery : IRequest<object>
    {
        public Int32 paymentid { get; set; }
    }
}
