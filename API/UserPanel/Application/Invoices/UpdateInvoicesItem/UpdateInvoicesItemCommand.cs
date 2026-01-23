using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.OrderMng.Invoices;
using Core.OrderMng.SaleOrder;
using MediatR;

namespace Application.Invoices.UpdateInvoicesitem
{
    public class UpdateInvoicesItemCommand : IRequest<object>
    {


        public InvoiceItemHeader Header { get; set; }

        public List<InvoiceItemDetail> Details { get; set; }

        public List<DeliveryOrderDetail> DODetail { get; set; }

    }
}

