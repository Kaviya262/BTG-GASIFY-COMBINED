using Application.Finance.ClaimAndPayment.Create;
using Core.Abstractions;
using Core.Finance.ClaimAndPayment;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Finance.ClaimAndPayment.Discuss
{
    public class DiscussClaimAndPaymentCommandHandler : IRequestHandler<DiscussClaimAndPaymentCommand, object>
    {
        private readonly IClaimAndPaymentRepository _repository;
        private readonly IUnitOfWorkDB3 financedb;

        public DiscussClaimAndPaymentCommandHandler(IClaimAndPaymentRepository repository, IUnitOfWorkDB3 _financedb)
        {
            _repository = repository;
             financedb = _financedb;
        }

        public async Task<object> Handle(DiscussClaimAndPaymentCommand command, CancellationToken cancellationToken)
        {
            DiscussClaim obj = new DiscussClaim();
            obj = command.discuss;
            var result = await _repository.DiscussClaim(obj);
            financedb.Commit();
            return result;
        }
    }
}
