
using Application.Procurement.Purchase_Memo.Delete;
using Core.Abstractions;
using Core.Finance.ClaimAndPayment;
using Core.Procurement.PurchaseMemo;
using MediatR;
using System.Threading;
using System.Threading.Tasks;
using UserPanel.Core.Abstractions;

namespace Application.Procurement.ClaimAndPayment.Delete
{
    public class DeleteMemoCommandHandler : IRequestHandler<DeleteMemoCommand, object>
    {
        private readonly IPurchaseMemoRepository _repository;
        private readonly IUnitOfWorkDB2 _unitOfWork;

        public DeleteMemoCommandHandler(IPurchaseMemoRepository repository, IUnitOfWorkDB2 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<object> Handle(DeleteMemoCommand command, CancellationToken cancellationToken)
        {
            InActiveMemo obj = new InActiveMemo();
            obj = command.delete;
            var result = await _repository.DeleteMemo(obj);
          //  financedb.Commit();
            return result;
        }
    }
}
