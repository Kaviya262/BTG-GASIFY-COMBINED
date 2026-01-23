using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Finance.Approval;
using Core.Finance.ClaimAndPayment;
using MediatR;

namespace Application.Finance.ClaimApproval.SeqNo
{
    public class PaymentSummarySeqCommand : IRequest<object>
    {
        public Int32 userid { get; set; }
        public Int32 branchId { get; set; }
        public Int32 orgid { get; set; }


    }
    
}

