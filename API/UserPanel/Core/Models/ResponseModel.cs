using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Models
{
    public class ResponseModel
    {
        public object? Data { get; set; }
        public bool Status { get; set; }
        public string? Message { get; set; }
        public int StatusCode { get; set; }
    }
}




