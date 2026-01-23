using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace Application.PackingAndDO.GetPackingPackNo
{
    public class GetPackingPackNoQuery : IRequest<object>
    {

        public Int32 BranchId { get; set; }
    }
}



