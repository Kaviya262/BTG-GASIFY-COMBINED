using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;
using Core.Abstractions;
using Core.Master.Country;
using MediatR;
using UserPanel.Core.Abstractions;

namespace Application.Master.CountryItem.GetCountryByName
{
    public class GetCountryByNameQueryHandler : IRequestHandler<GetCountryByNameQuery, object>
    {
        private readonly ICountryRepository _repository;
        private readonly IUnitOfWorkDB1 _unitOfWork;
        public GetCountryByNameQueryHandler(ICountryRepository repository, IUnitOfWorkDB1 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }
        #region Handle
        public async Task<object> Handle(GetCountryByNameQuery query, CancellationToken cancellationToken)
        {
            var countryitems = new CountryItemMain
            {
                Header = query.Header
            };
            int opt = 4;
            int Id = 0;
            string contCode = string.Empty;
            var data = await _repository.GetCountryByNameAsync(opt, Id, contCode, query.contName);
            _unitOfWork.Commit();
            return data;
        }
        #endregion





    }
}
