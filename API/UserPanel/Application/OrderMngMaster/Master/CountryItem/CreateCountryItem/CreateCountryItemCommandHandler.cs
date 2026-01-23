using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Master.Country;
using Core.OrderMng.Invoices;
using MediatR;
using Application.Master.CountryItem.CreateCountryItem;
using UserPanel.Core.Abstractions;
using Core.Abstractions;

namespace Application.Master.CountryItem.CreateCountryItem
{
    public class CreateCountryItemCommandHandler : IRequestHandler<CreateCountryItemCommand, object>
    {
        private readonly ICountryRepository _repository;
        private readonly IUnitOfWorkDB1 _unitOfWork;

        public CreateCountryItemCommandHandler(ICountryRepository repository, IUnitOfWorkDB1 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }
        #region Handle
        public async Task<object> Handle(CreateCountryItemCommand command, CancellationToken cancellationToken)
        {
            var countryItems = new CountryItemMain
               { 
                Header = command.Header
               };
            
            var data = await _repository.CreateCountryAsync(countryItems);
            _unitOfWork.Commit();
            return data;

        }
        #endregion
    }
}
