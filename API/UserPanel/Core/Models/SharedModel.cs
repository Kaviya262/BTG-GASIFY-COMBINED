using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Models
{
    public class SharedModel
    {
        public int result { get; set; }
            public string text { get; set; }
    }
    public class SharedModelWithResponse
    {
        public SharedModel Data { get; set; }
        public bool Status { get; set; }
        public string Message { get; set; }
    }
}
