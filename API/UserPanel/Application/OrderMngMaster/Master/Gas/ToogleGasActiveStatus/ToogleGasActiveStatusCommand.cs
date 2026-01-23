using MediatR;

namespace Application.OrderMngMaster.Master.Gas.ToogleGasActiveStatus
{
    public class ToogleGasActiveStatusCommand : IRequest<object>
    {
        public int Id { get; set; }

        public bool IsActive { get; set; }
    }
}
