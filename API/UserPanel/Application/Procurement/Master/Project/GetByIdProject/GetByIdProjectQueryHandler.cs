using Application.Procurement.Master.Project.GetListProject;
using Core.Abstractions;
using Core.Procurement.Master;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Master.Project.GetByIdProject
{
    public class GetByIdProjectQueryHandler : IRequestHandler<GetByIdProjectQuery, object>
    {
        private readonly IProjectRepository _repository;
        private readonly IUnitOfWorkDB4 _unitOfWorkDB4;

        public GetByIdProjectQueryHandler(IProjectRepository repository, IUnitOfWorkDB4 unitOfWorkDB4)
        {
            _repository = repository;
            _unitOfWorkDB4 = unitOfWorkDB4;
        }

        public async Task<object> Handle(GetByIdProjectQuery request, CancellationToken cancellationToken)
        {
            return await _repository.GetProjectByIdAsync(request.projectid, request.branchid, request.orgid);
        }
    }
}