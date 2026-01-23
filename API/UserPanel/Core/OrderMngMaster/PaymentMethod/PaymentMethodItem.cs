using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Master.PaymentMethod
{
    public class PaymentMethodItem
    {
        public class PaymentMethodItemMain
        {
            public PaymentMethodItemHeader Header { get; set; }
            public int PaymentMId { get; set; }
            public string PaymentMCode { get; set; }
            public string PaymentMethodName { get; set; }
        }
        public class PaymentMethodItemHeader
        {
            public string PaymentMethodName { get; set; }
            public int PaymentMethodId { get; set; }
            public string PaymentMethodCode { get; set; }
            public int UserId { get; set; }

            [Range(0, 1, ErrorMessage = "IsActive must be either 1 or 0 !!")]
            public int IsActive { get; set; }

            //public string CreaetedIP { get; set; }
            //public DateTime CreatedDate { get; set; }
            //public string ModifiedBy { get; set; }
            //public string ModifiedIP { get; set; }
            //public DateTime ModifiedDate { get; set; }

        }





    }

}
