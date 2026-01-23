using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.OrderMng.Invoices;
using Core.OrderMng.SaleOrder;
using MediatR;

namespace UserPanel.Application.Invoices.CreateInvoicesItem
{
    public class CreateInvoicesItemCommand : IRequest<object>
    {
        public InvoiceItemHeader Header { get; set; }

        public List<InvoiceItemDetail> Details { get; set; }

        public List<DeliveryOrderDetail> DODetail { get; set; }
    }
}

