using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Master.ErrorLog
{
    public class MasterErrorModel
    {

    }
    public class ErrorLogMasterModel
    {
        public string ErrorMessage { get; set; }
        public string ErrorType { get; set; }
        public string StackTrace { get; set; }
        public string Source { get; set; }
        public string Method_Function { get; set; }
        public string InnerException { get; set; }
        public int? UserId { get; set; }
        public int? ScreenId { get; set; }
        public string ScreenName { get; set; }
        public int? ModuleId { get; set; }
        public string ModuleName { get; set; }
        public string RequestData_Payload { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
        public int IsActive { get; set; }
        public string Environment { get; set; }
        public string ServerName { get; set; }
        public string ErrorCode { get; set; }
    }
}
