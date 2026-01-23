
using MediatR;

namespace Application.Barcode.OptBarcodeScan
{
    public class OptBarcodeScanCommand : IRequest<object>

    {
        public Int32 PackingId { get; set; }

    }
}







