using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Core.Master.PaymentTerms.PaymentTermItem;

namespace Core.Master.PaymentTerms
{
    public interface IPaymentTermRepository
    {
        Task<object> GetAllPaymentTermAsync(int opt, int payTermId, string payTermCode);
        Task<object> GetPaymentTermByIdAsync(int opt, int payTermId, string payTermCode);
        Task<object> GetPaymentTermByCodeAsync(int opt, int payTermId, string payTermCode);
        Task<object> CreatePaymentTermAsync(PaymentTermMain payTerm);
        Task<object> UpdatePaymentTermAsync(PaymentTermMain payTerm);
        Task<object> UpdateStatus(PaymentTermMain command);

    }
}
