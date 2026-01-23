using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace Application.PackingAndDO.GenerateInvoice
{
    public class GenerateInvoiceItemsQuery : IRequest<object>
    {
        public int PackingId { get; set; }
        public string DOID { get; set; }
    }
}





