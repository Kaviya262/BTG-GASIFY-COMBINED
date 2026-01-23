using Core.Master.Gas;
using MediatR;

namespace Application.OrderMngMaster.Master.Gas.UpdateGas
{
    public class UpdateGasCommand : IRequest<object>
    {
        public MasterGas Gas { get; set; } = null!;
    }
}
