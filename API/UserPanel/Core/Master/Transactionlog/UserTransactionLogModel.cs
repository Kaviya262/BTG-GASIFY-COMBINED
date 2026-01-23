using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Master.Transactionlog
{
    public class UserTransactionLogModel
    {
        public long TransactionLogId { get; set; }
        public string TransactionId { get; set; }
        public int? ModuleId { get; set; }
        public int? ScreenId { get; set; }
        public string ModuleName { get; set; }
        public string ScreenName { get; set; }
        public int? OrgId { get; set; }
        public int? BranchId { get; set; }
        public int? UserId { get; set; }
        public int? RoleId { get; set; }
        public string UserName { get; set; }
        public string RoleName { get; set; }
        public string ActionType { get; set; }
        public string ActionDescription { get; set; }
        public string TableName { get; set; }
        public string OldValue { get; set; }
        public string NewValue { get; set; }
        public string IPAddress { get; set; }
        public string MachineName { get; set; }
        public string BrowserInfo { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime ModifiedDate { get; set; }
        public int IsActive { get; set; } = 1;

        public int DbLog { get; set; }
    }
}
