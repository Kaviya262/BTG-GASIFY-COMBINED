using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using MediatR;

using UserPanel.Core.Abstractions;


using Core.OrderMng.SaleOrder;
using Core.OrderMng.Barcode;
using Core.Abstractions;

namespace Application.Barcode.DeleteBarcode
{
    public  class DeleteBarcodeItemCommandHandler : IRequestHandler<DeleteBarcodeItemCommand, object>
    {
        private readonly IBarcodeRepository _repository;

        private readonly IUnitOfWorkDB1 _unitOfWork;
        
        
        public DeleteBarcodeItemCommandHandler(IBarcodeRepository repository, IUnitOfWorkDB1 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
            
        }
        public async Task<object> Handle(DeleteBarcodeItemCommand command,CancellationToken cancellationToken)
        { 

            var data = await _repository.DeleteBarcode(command.PackingId,command.BarcodeDtlid);
            _unitOfWork.Commit();

            return data;


        }
    }
}



