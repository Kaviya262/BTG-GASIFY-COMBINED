using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Finance_new;
using MediatR;

namespace Application.Financenew.AR.Create
{
    public class CreateARCommand : IRequest<object>
    {
        //public ArReceiptInput Header { get; set; }

        public int orgId { get; set; }
        public int branchId { get; set; }
        public int userId { get; set; }
        public string userIp { get; set; }
        public int invoiceId { get; set; }
        public int typeid { get; set; }


    }
    
}

