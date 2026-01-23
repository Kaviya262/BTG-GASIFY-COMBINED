using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.PackingAndDO.GetPackingItem
{
    public class GetPackingItemByIdQuery : IRequest<object>
    {
        public Int32 Id { get; set; }
    }
}
