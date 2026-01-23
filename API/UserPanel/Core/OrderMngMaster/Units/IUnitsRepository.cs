using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Core.Master.PaymentMethod.PaymentMethodItem;
using static Core.Master.Units.UnitsItem;

namespace Core.Master.Units
{
    public interface IUnitsRepository
    {
        Task<object> GetAllUnitsAsync(int opt, int unitsId, string unitsCode);
        Task<object> GetUnitsByIdAsync(int opt, int unitsId, string unitsCode);
        Task<object> GetUnitsByCodeAsync(int opt, int unitsId, string unitsCode);
        Task<object> CreateUnitsAsync(UnitsItemMain unitsObj);
        Task<object> UpdateUnitsAsync(UnitsItemMain unitsObj);
    }
}
