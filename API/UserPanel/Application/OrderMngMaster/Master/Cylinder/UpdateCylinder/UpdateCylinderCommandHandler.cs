using Core.Master.Cylinder;
using MediatR;

namespace Application.OrderMngMaster.Master.Cylinder.UpdateCylinder
{
    public class UpdateCylinderCommandHandler : IRequestHandler<UpdateCylinderCommand, object>
    {
        private readonly IMasterCylinderRepository _repository;

        public UpdateCylinderCommandHandler(IMasterCylinderRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(UpdateCylinderCommand request, CancellationToken cancellationToken)
        {
            var data = await _repository.UpdateAsync(request.Cylinder);
            return data;
        }
    }
}
