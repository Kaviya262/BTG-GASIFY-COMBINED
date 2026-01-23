using MediatR;

namespace Application.Distribution.PackingList.GetbyId
{
    public class GetByIdPackingBarcode : IRequest<object>
    {
        public int userId { get; set; }
        public int PackingDetailsId { get; set; }
        public int PackingId { get; set; }
        public int BranchId { get; set; }
    }
}
