using Core.Abstractions;
using Core.Finance.ClaimAndPayment;
using Core.Procurement.PurchaseRequisition;
using MediatR;

namespace Application.Procurement.Purchase_Requitision.UploadDo
{
    public class UploadPurchaeRequistionCommandHandler : IRequestHandler<UploadPurchaeRequistionCommand, object>
    {
        private readonly IPurchaseRequisitionRepository _repository;

        private readonly IUnitOfWorkDB2 _unitOfWork;

        public UploadPurchaeRequistionCommandHandler(IPurchaseRequisitionRepository repository, IUnitOfWorkDB3 _unitOfWork)
        {
            _repository = repository;
            _unitOfWork = _unitOfWork;
        }

        public async Task<object> Handle(UploadPurchaeRequistionCommand command, CancellationToken cancellationToken)
        {

            var result = await _repository.UploadDO(command.Id, command.Path, command.filename);
            
            return result;
        }
    }
}
