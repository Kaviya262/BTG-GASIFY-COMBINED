using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Master.PaymentTerms
{
    public class PaymentTermItem
    {
        public class PaymentTermMain
        {
            public PaymentTermHeader Header { get; set; }
            public int PayTermId { get; set; }
            public string PayTermCode { get; set; }
        }
        public class PaymentTermHeader
        {
            public int PaymentTermId { get; set; }
            public string PaymentTermCode { get; set; }
            public string? PaymentMethodName { get; set; }
            public string DueDays { get; set; }

            [Range(0, 1, ErrorMessage = "IsActive must be either 1 or 0 !!")]
            public int IsActive { get; set; }
            public int UserId { get; set; }
            public string PaymentTermDesc { get; set; }
          
        }




    }
}
