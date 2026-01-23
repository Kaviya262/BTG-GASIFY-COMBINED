using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Master.Units.UpdateUnitsItem;
using Core.Master.Units;
using MediatR;
using static Core.Master.Units.UnitsItem;
using UserPanel.Core.Abstractions;
using Core.Abstractions;

namespace Application.Master.Units.CreateUnitsItem
{
    public class CreateUnitsItemCommandHandler : IRequestHandler<CreateUnitsItemCommand, object>
    {

        private readonly IUnitsRepository _repository;
        private readonly IUnitOfWorkDB1 _unitOfWork;

        public CreateUnitsItemCommandHandler(IUnitsRepository repository, IUnitOfWorkDB1 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }
        #region Handle
        public async Task<object> Handle(CreateUnitsItemCommand command, CancellationToken cancellationToken)
        {
            UnitsItemMain units = new UnitsItemMain();
            units.Header = command.Header;

            var data = await _repository.CreateUnitsAsync(units);
            _unitOfWork.Commit();
            return data;

        }
        #endregion
    }

}
