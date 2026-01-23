using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Master.PaymentTerms.GetPaymentTermItemById;
using Core.Master.PaymentTerms;
using MediatR;
using static Core.Master.PaymentTerms.PaymentTermItem;
using UserPanel.Core.Abstractions;
using Core.Master.Units;
using static Core.Master.Units.UnitsItem;
using Core.Abstractions;

namespace Application.Master.Units.GetAllUnitsItem
{
    public class GetAllUnitsItemQueryHandler : IRequestHandler<GetAllUnitsItemQuery, object>
    {

        private readonly IUnitsRepository _repository;
        private readonly IUnitOfWorkDB1 _unitOfWork;

        public GetAllUnitsItemQueryHandler(IUnitsRepository repository, IUnitOfWorkDB1 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }
        #region Handle
        public async Task<object> Handle(GetAllUnitsItemQuery query, CancellationToken cancellationToken)
        {
            var units = new UnitsItemMain
            {
                Header = query.Header
            };

            int opt = 1;
            int unitsId = 0;
           
            var data = await _repository.GetAllUnitsAsync(opt, unitsId , query.UnitsCode);            

            _unitOfWork.Commit();
            return data;

        }
        #endregion
    }


}
