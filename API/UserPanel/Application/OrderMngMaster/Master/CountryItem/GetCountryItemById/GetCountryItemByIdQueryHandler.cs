using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Master.Country;
using MediatR;
using UserPanel.Core.Abstractions;


namespace Application.Master.CountryItem.GetCountryItemById
{
    public class GetCountryItemByIdQueryHandler : IRequestHandler<GetCountryItemByIdQuery, object>
    {
        private readonly ICountryRepository _repository;
       
        public GetCountryItemByIdQueryHandler(ICountryRepository repository)
        {
            _repository = repository;            
        }
        #region Handle
        public async Task<object> Handle(GetCountryItemByIdQuery query, CancellationToken cancellationToken)
        {
            var countryitems = new CountryItemMain
            {
                Header = query.Header
            };
            int opt = 2;
            string contCode = string.Empty;
            string contName = string.Empty;
            var data = await _repository.GetCountryByIdAsync(opt,query.Id, contCode, contName);

            return data;
        }
        #endregion

    }
}
