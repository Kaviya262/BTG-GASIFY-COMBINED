using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.OrderMng.Invoices;

namespace Core.Master.Country
{
    public interface ICountryRepository
    {
        Task<object> GetAllCountriesAsync(int opt,int countryId,string countryCode, string countryName);
        Task<object> GetCountryByCodeAsync(int opt, int countryId, string countryCode, string countryName);
        Task<object> GetCountryByNameAsync(int opt, int countryId, string countryCode, string countryName);
        Task<object> GetCountryByIdAsync(int opt, int countryId, string countryCode, string countryName);
        Task<object> CreateCountryAsync(CountryItemMain country);
        Task<object> UpdateCountryAsync(CountryItemMain country);
       
    }
}
