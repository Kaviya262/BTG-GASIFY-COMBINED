using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.OrderMng.Barcode;
using MediatR;

namespace Application.Barcode.SaveBarcodeScan
{
    public class SaveBarcodeScanCommandHandler : IRequestHandler<SaveBarcodeScanCommand, object>
    {
        private readonly IBarcodeRepository _repository;
        public SaveBarcodeScanCommandHandler(IBarcodeRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(SaveBarcodeScanCommand query, CancellationToken cancellationToken)
        {
            var Result = await _repository.SaveBarcodeScan(query.PackingId,query.rackid);
            return Result;
        }
    }
}
