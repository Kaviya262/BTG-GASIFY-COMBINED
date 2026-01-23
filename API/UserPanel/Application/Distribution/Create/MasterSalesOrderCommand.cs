using Core.OrderMng.PackingAndDO;
using MediatR;

namespace Application
{
    public class    CreatePackingAndDOCommand : IRequest<object>
    {
        public PackingAndDOHeader Header { get; set; }
        public List<PackingAndDOCustomer> Customers { get; set; }
        public List<PackingAndDOSO> SODtl { get; set; }
        public List<PackingAndDODetails> Details { get; set; }
        public List<PackingAndDOGas> GasDtl { get; set; }
        public int BranchId { get; set; }
        public int PackingId { get; set; }
        public int StageId { get; set; }


    }

}
