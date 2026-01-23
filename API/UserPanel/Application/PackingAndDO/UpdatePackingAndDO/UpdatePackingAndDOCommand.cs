using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.OrderMng.PackingAndDO;
using MediatR;

namespace Application.PackingAndDO.UpdatePackingAndDO
{
    public class UpdatePackingAndDOCommand : IRequest<object>
    {

        public PackingAndDOHeader Header { get; set; }
        public List<PackingAndDOCustomer> Customers { get; set; }
        public List<PackingAndDOSO> SODtl { get; set; }
        public List<PackingAndDODetails> Details { get; set; }
        public List<PackingAndDOGas> GasDtl { get; set; }
    }
}


