using Core.Master.Cylinder;
using MediatR;

namespace Application.OrderMngMaster.Master.Cylinder.CreateCylinder
{
    public class CreateCylinderCommandHandler : IRequestHandler<CreateCylinderCommand, object>
    {
        private readonly IMasterCylinderRepository _repository;

        public CreateCylinderCommandHandler(IMasterCylinderRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(CreateCylinderCommand request, CancellationToken cancellationToken)
        {
            var data = await _repository.AddAsync(request.Cylinder);
            return data;
        }
    }
}
