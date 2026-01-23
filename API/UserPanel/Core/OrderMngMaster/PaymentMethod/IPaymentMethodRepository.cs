using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Core.Master.Department.DepartmentItem;
using static Core.Master.PaymentMethod.PaymentMethodItem;

namespace Core.Master.PaymentMethod
{
    public interface IPaymentMethodRepository
    {
        Task<object> GetAllPaymentMethodAsync(int opt, int payMid, string paymentMCode);
        Task<object> GetPaymentMethodByIdAsync(int opt, int paymentMId, string payMcode);
        Task<object> GetPaymentMethodByCodeAsync(int opt, int payMid, string paymentMCode);
        Task<object> CreatePaymentMethodAsync(PaymentMethodItemMain paymentM);
        Task<object> UpdatePaymentMethodAsync(PaymentMethodItemMain paymentM);
        Task<object> UpdateStatus(PaymentMethodItemMain paymentM);
    }
}
