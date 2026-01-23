using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace Application.Procurement.Purchase_Requitision.GetPRTypeAutoComplete
{
    public class GetPRTypeAutoCompleteQuery : IRequest<object>
    {
        public int branchid { get; set; }
        public int orgid { get; set; }
        public string prtype { get; set; }

    }
}
