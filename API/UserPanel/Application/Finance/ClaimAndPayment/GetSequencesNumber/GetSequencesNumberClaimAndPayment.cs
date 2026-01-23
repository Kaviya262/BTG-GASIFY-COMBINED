using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace Application.Finance.ClaimAndPayment.GetSequencesNumber
{
    public class GetSequencesNumberClaimAndPayment :IRequest<object>
    {
        public int BranchId { get; set; }
        public int orgid { get; set; }
        public int userid { get; set; }
    }
}
