using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace Application.Barcode.SaveBarcodeScan
{
    public class SaveBarcodeScanCommand : IRequest<object>
    {
        public int PackingId { get; set; }
        public int rackid { get; set; }

    }
}
