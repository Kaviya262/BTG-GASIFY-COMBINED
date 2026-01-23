using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Master.Country;
using static Core.Master.Currency.CurrencyItem;

namespace Core.Master.Currency
{
    public interface ICurrencyRepository
    {
        Task<object> GetAllCurrenciesAsync(int opt,int currencyId, string currencyCode, string currencyName);
        Task<object> GetCurrencyByIdAsync(int opt, int currencyId, string currencyCode, string currencyName);
        Task<object> GetCurrencyByCodeAsync(int opt, int currencyId, string currencyCode, string currencyName);
        Task<object> GetCurrencyByNameAsync(int opt, int currencyId, string currencyCode, string currencyName);
        Task<object> CreateCurrencyAsync(CurrencyItemMain currency);
        Task<object> UpdateCurrencyAsync(CurrencyItemMain currency);
        Task<object> UpdateCurrencyStatusAsync(CurrencyItemMain currency);

    }
}
