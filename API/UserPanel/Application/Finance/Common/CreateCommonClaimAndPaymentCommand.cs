using MediatR;

namespace Application.Finance.Common
{
    public class CreateCommonClaimAndPaymentCommand : IRequest<object>
    {
        public Int32 opt { get; set; }
        public Int32 branchid { get; set; }
        public string searchtext { get; set; }
        public Int32 orgid { get; set; }
        public Int32 pmid { get; set; }
        public Int32 prid { get; set; }
        public Int32 Id { get; set; }
        public Int32 categoryid { get; set; }
        public Int32 claimtype_id { get; set; }
        public Int32 supplierid { get; set; }
    }
}
