using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Abstractions;
using Core.Master.Country;
using Core.OrderMng.Invoices;
using MediatR;
using UserPanel.Core.Abstractions;

namespace Application.Master.CountryItem.UpdateCountryItem
{
    public class UpdateCountryItemCommandHandler : IRequestHandler<UpdateCountryItemCommand, object>
    {
        private readonly ICountryRepository _repository;
        private readonly IUnitOfWorkDB1 _unitOfWork;
    
    public UpdateCountryItemCommandHandler(ICountryRepository repository, IUnitOfWorkDB1 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }
        #region Handle
        public async Task<object> Handle(UpdateCountryItemCommand command, CancellationToken cancellationToken)
        {
            var countryItems = new CountryItemMain
            {
                Header = command.Header
            };
            
            var data = await _repository.UpdateCountryAsync(countryItems);
            _unitOfWork.Commit();

            return data;

        }
        #endregion
    }

}