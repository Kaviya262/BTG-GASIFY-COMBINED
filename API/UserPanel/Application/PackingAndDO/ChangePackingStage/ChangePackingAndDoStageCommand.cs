using Core.OrderMng.PackingAndDO;
using MediatR;

namespace Application.PackingAndDO.CreatePackingAndDO
{

    public class ChangePackingAndDoStageCommand : IRequest<object>
    {
        public int BranchId { get; set; }
        public int PackingId { get; set; }
        public int StageId { get; set; }

    }



}