using Core.Finance.ClaimAndPayment;
using Core.Finance_new;
using MediatR;

namespace Application.Financenew.AR.Update
{
    public class UpdateARCommand : IRequest<object>
    {
        public int orgId { get; set; }
        public int branchId { get; set; }
        public int userId { get; set; }
        public string userIp { get; set; }
        public IEnumerable<ArReceiptInput> Header { get; set; }
    }

}
