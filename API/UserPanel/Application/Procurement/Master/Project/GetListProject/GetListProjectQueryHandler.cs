using Core.Abstractions;
using Core.Procurement.Master;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Master.Project.GetListProject
{
    public class GetListProjectQueryHandler : IRequestHandler<GetListProjectQuery, object>
    {
        private readonly IProjectRepository _repository;
        private readonly IUnitOfWorkDB4 _unitOfWorkDB4;

        public GetListProjectQueryHandler(IProjectRepository repository, IUnitOfWorkDB4 unitOfWorkDB4)
        {
            _repository = repository;
            _unitOfWorkDB4 = unitOfWorkDB4;
        }

        public async Task<object> Handle(GetListProjectQuery request, CancellationToken cancellationToken)
        {
            return await _repository.GetListProjectAsync(request.projectcode, request.projectname, request.userid, request.branchid, request.orgid);
        }
    }
}
