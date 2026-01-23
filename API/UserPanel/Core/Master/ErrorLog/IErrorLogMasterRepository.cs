using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Master.ErrorLog
{
    public interface IErrorLogMasterRepository
    {
        Task<object> LogErrorAsync(ErrorLogMasterModel error);
    }
}
