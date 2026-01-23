using Application.Finance.ClaimAndPayment.Create;
using Core.Abstractions;
using Core.Finance.ClaimAndPayment;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Finance.ClaimAndPayment.Delete
{
    public class DeleteClaimAndPaymentCommandHandler : IRequestHandler<DeleteClaimAndPaymentCommand, object>
    {
        private readonly IClaimAndPaymentRepository _repository;
        private readonly IUnitOfWorkDB3 financedb;

        public DeleteClaimAndPaymentCommandHandler(IClaimAndPaymentRepository repository, IUnitOfWorkDB3 _financedb)
        {
            _repository = repository;
             financedb = _financedb;
        }

        public async Task<object> Handle(DeleteClaimAndPaymentCommand command, CancellationToken cancellationToken)
        {
            InActiveClaim obj = new InActiveClaim();
            obj = command.delete;
            var result = await _repository.DeleteClaim(obj);
            financedb.Commit();
            return result;
        }
    }
}
