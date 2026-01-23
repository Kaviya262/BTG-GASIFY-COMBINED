using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Master.Country
{
        public class CountryItemMain
        { // declare
            public CountryItemHeader Header { get; set; }
            
            public Int32 CountryId { get; set; }
            public string CountryCode { get; set; }
            public string CountryName { get; set; }

        }

        public class CountryItemHeader
        {
        public Int32 CountryId { get; set; }
        public string CountryCode { get; set; }
        public string CountryName { get; set; }

        [Range(0,1,ErrorMessage = "IsActive must be either 1 or 0 !!")]
        public int IsActive { get; set; }
        public Int32 UserId { get; set; }
        //public string CreaetedIP { get; set; }
        //public DateTime CreatedDate { get; set; }
        //public string ModifiedBy { get; set; }
        //public string ModifiedIP { get; set; }
        //public DateTime ModifiedDate { get; set; }
       }

}
