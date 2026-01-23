using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Abstractions;
using Core.Master.Country;
using MediatR;
using UserPanel.Core.Abstractions;

namespace Application.Master.CountryItem.GetCountryByCode
{
    public class GetCountryByCodeQueryHandler : IRequestHandler<GetCountryByCodeQuery, object>
    {
        private readonly ICountryRepository _repository;
        private readonly IUnitOfWorkDB1 _unitOfWork;
        public GetCountryByCodeQueryHandler(ICountryRepository repository, IUnitOfWorkDB1 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }
        #region Handle
        public async Task<object> Handle(GetCountryByCodeQuery query, CancellationToken cancellationToken)
        {
            var countryitems = new CountryItemMain
            {
                Header = query.Header
            };
            int opt = 3;
            int Id = 0;
            string contName = string.Empty;
            var data = await _repository.GetCountryByCodeAsync(opt,Id, query.contCode, contName);
            _unitOfWork.Commit();
            return data;
        }

        #endregion



    }
}
