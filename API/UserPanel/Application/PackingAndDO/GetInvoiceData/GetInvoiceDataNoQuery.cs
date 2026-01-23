using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace Application.PackingAndDO.GetInvoiceData
{
    public class GetInvoiceDataNoQuery : IRequest<object>
    {

        public Int32 PackingId { get; set; }
    }
}



