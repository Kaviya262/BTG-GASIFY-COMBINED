using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.OrderMng.Barcode;
using MediatR;


namespace Application.Barcode.OptBarcodeScan
{
    public class OptBarcodeScanCommandHandler : IRequestHandler<OptBarcodeScanCommand, object>
    {
        private readonly IBarcodeRepository _repository;
  

        public OptBarcodeScanCommandHandler(IBarcodeRepository repository)
        {
            _repository = repository;
        }

       

        public async Task<object> Handle(OptBarcodeScanCommand command,CancellationToken cancellationToken)
        {


            var Result = await _repository.OptBarcodeScan(command.PackingId);
            return Result;

        }

       
    }
}





