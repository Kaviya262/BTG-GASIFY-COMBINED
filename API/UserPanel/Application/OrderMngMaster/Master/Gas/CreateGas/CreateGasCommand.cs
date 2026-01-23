using Core.Master.Gas;
using MediatR;

namespace Application.OrderMngMaster.Master.Gas.CreateGas
{
    public class CreateGasCommand : IRequest<object>
    {
        public MasterGas Gas { get; set; } = null!;
    }

}
