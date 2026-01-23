using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace Application.Distribution.PackingList.Create
{
    public class CreatePackingListCommand : IRequest<object>
    {
        public int RackId { get; set; }
        public int PackingDetailsId { get; set; }
        public int PackingId { get; set; }
        public string Barcodes { get; set; }
        public bool IsSubmitted { get; set; }
        public int userId { get; set; }
        public string? PackNo { get; set; }
    }
}
