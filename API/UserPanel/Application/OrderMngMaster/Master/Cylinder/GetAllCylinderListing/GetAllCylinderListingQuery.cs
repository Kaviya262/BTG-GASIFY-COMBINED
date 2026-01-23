using MediatR;

namespace Application.OrderMngMaster.Master.Cylinder.GetAllCynlinderListing
{
    public class GetAllCylinderListingQuery : IRequest<object>
    {
        public string CylinderName { get; set; } = null!;
        public string FromDate { get; set; } = null!;
        public string ToDate { get; set; } = null!;
    }
}
