using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Master.Units.UpdateUnitsItem;
using MediatR;
using UserPanel.Core.Abstractions;
using Core.Master.Units;
using static Core.Master.Units.UnitsItem;
using Core.Abstractions;

namespace Application.Master.Units.UpdateUnitsItem
{
    public class UpdateUnitsItemCommandHandler : IRequestHandler<UpdateUnitsItemCommand, object>
    {

        private readonly IUnitsRepository _repository;
        private readonly IUnitOfWorkDB1 _unitOfWork;

        public UpdateUnitsItemCommandHandler(IUnitsRepository repository, IUnitOfWorkDB1 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }
        #region Handle
        public async Task<object> Handle(UpdateUnitsItemCommand command, CancellationToken cancellationToken)
        {
            UnitsItemMain units = new UnitsItemMain();
            units.Header = command.Header;

            var data = await _repository.UpdateUnitsAsync(units);
            _unitOfWork.Commit();
            return data;

        }
        #endregion
    }



}