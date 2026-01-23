using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Master.Claim;
using MediatR;

namespace Application.Procurement.Master.GetClaimPaymentById
{
    public class GetClaimPaymentByIdQuery : IRequest<object>
    {
        public int Id { get; set; }
    }
}
