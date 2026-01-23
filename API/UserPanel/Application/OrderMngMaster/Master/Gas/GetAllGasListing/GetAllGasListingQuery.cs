using MediatR;

namespace Application.OrderMngMaster.Master.Gas.GetAllGasListing
{
    public class GetAllGasListingQuery : IRequest<object>
    {
        public string GasName { get; set; } = null!;
        public string volume { get; set; } = null!;
        public string pressure { get; set; } = null!;
        public string FromDate { get; set; } = null!;
        public string ToDate { get; set; } = null!;
    }
}
