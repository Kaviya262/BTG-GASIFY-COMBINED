using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace Application.Quotation.CopyQuotationItem
{
    public class CopyQuotationItemByIdQuery : IRequest<object>
    {
        public Int32 Id { get; set; }
    }
}