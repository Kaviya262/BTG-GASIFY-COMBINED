using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Master.Transactionlog
{
    public interface IUserTransactionLogRepository
    {
        Task<object> LogTransactionAsync(UserTransactionLogModel log);
    }
}
