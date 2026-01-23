using Application.Procurement.Master.Project.CreateProject;
using Core.Abstractions;
using Core.Procurement.Master;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Master.Project.UpdateProject
{
    public class UpdateProjectCommandHandler : IRequestHandler<UpdateProjectCommand, object>
    {
        private readonly IProjectRepository _repository;
        private readonly IUnitOfWorkDB4 _unitOfWork;

        public UpdateProjectCommandHandler(IProjectRepository repository, IUnitOfWorkDB4 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<object> Handle(UpdateProjectCommand command, CancellationToken cancellationToken)
        {
            MasterProject proj = command.Project;            

            var data = await _repository.UpdateAsync(proj);
            _unitOfWork.Commit();
            return data;

        }

    }
}

