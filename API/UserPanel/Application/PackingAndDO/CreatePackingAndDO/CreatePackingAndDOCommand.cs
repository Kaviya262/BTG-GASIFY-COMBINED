using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.OrderMng.SaleOrder;
using Core.OrderMng.Quotation;
using MediatR;
using Core.OrderMng.PackingAndDO;

namespace Application.PackingAndDO.CreatePackingAndDO
{

    public class CreatePackingAndDOCommands : IRequest<object>
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