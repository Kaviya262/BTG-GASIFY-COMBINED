using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Master.CountryItem.CreateCountryItem;
using Core.Abstractions;
using Core.Master.Country;
using MediatR;
using UserPanel.Core.Abstractions;

namespace Application.Master.CountryItem.GetAllCountryItem
{
    public class GetAllCountryItemQueryHandler : IRequestHandler<GetAllCountryItemQuery, object>
    {
        private readonly ICountryRepository _repository;
        private readonly IUnitOfWorkDB1 _unitOfWork;       

        public GetAllCountryItemQueryHandler(ICountryRepository repository,  IUnitOfWorkDB1 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }
        #region Handle
        public async Task<object> Handle(GetAllCountryItemQuery query, CancellationToken cancellationToken)
        {
            var countryitems = new CountryItemMain
            {
                Header = query.Header
            };
            int opt = 1;
            int Id = 0;
            var data = await _repository.GetAllCountriesAsync(opt, Id, query.CountryCode, query.CountryName);               
            _unitOfWork.Commit();
            return data;

        }
        #endregion



    }
}
