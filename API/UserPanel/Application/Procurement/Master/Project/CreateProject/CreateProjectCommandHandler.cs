using Application.Procurement.Master.Item.CreateItem;
using Core.Abstractions;
using Core.Master.Item;
using Core.Procurement.Master;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Master.Project.CreateProject
{
    public class CreateProjectCommandHandler : IRequestHandler<CreateProjectCommand, object>
    {
        private readonly IProjectRepository _repository;
        private readonly IUnitOfWorkDB4 _unitOfWork;

        public CreateProjectCommandHandler(IProjectRepository repository, IUnitOfWorkDB4 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<object> Handle(CreateProjectCommand command, CancellationToken cancellationToken)
        {
            MasterProject proj = command.Project;            

            var data = await _repository.AddAsync(proj);
            _unitOfWork.Commit();
            return data;

        }

    }
}

