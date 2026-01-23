using Core.Abstractions;
using MediatR;

namespace Application.Distribution.PackingList.GetbyId
{
    public class GetByIdPackingBarcodeHandler : IRequestHandler<GetByIdPackingBarcode, object>
    {
        private readonly Core.OrderMng.Distribution.PackingList.IPackingListRepository _repository;
        private readonly IUnitOfWorkDB1 _unitOfWork;
        public GetByIdPackingBarcodeHandler(Core.OrderMng.Distribution.PackingList.IPackingListRepository repository, IUnitOfWorkDB1 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }
        public async Task<object> Handle(GetByIdPackingBarcode command, CancellationToken cancellationToken)
        {
            var Result = await _repository.GetByIdBarcode(command.BranchId, command.PackingId, command.PackingDetailsId);
            return Result;

        }
    }
}
