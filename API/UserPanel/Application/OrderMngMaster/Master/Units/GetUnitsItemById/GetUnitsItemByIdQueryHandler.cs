using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Master.Units.GetUnitsItemById;
using Core.Master.PaymentTerms;
using MediatR;
using UserPanel.Core.Abstractions;
using Core.Master.Units;
using static Core.Master.Units.UnitsItem;
using Core.Abstractions;

namespace Application.Master.Units.GetUnitsItemById
{
    public class GetUnitsItemByIdQueryHandler : IRequestHandler<GetUnitsItemByIdQuery, object>
    {

        private readonly IUnitsRepository _repository;
        private readonly IUnitOfWorkDB1 _unitOfWork;

        public GetUnitsItemByIdQueryHandler(IUnitsRepository repository, IUnitOfWorkDB1 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }
        #region Handle
        public async Task<object> Handle(GetUnitsItemByIdQuery query, CancellationToken cancellationToken)
        {
            var payTerms = new UnitsItemMain
            {
                Header = query.Header
            };                    
            
            if (query.Id > 0)
            {
                int opt = 2;
                var unitsCode = "";
                var result = await _repository.GetUnitsByIdAsync(opt, query.Id, unitsCode);
                _unitOfWork.Commit();
                return result ?? new { };
            }
            else if (query.SearchCode != null)
            {
                int opt = 3;
                int unitsId = 0;
                var result = await _repository.GetUnitsByCodeAsync(opt,unitsId,query.SearchCode);
                _unitOfWork.Commit();
                return result?? new { };
            }

            return new { message ="Invalid query.Provider Id or Search Code!"};
            

        }
        #endregion
    }



}
