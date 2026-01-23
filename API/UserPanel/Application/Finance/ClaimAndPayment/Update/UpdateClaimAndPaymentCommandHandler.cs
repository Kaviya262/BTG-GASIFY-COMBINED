using Application.Finance.ClaimAndPayment.Create;
using Core.Abstractions;
using Core.Finance.ClaimAndPayment;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Finance.ClaimAndPayment.Update
{
    public class UpdateClaimAndPaymentCommandHandler : IRequestHandler<UpdateClaimAndPaymentCommand, object>
    {
        private readonly IClaimAndPaymentRepository _repository;
        private readonly IUnitOfWorkDB3 financedb;

        public UpdateClaimAndPaymentCommandHandler(IClaimAndPaymentRepository repository, IUnitOfWorkDB3 _financedb)
        {
            _repository = repository;
             financedb = _financedb;
        }

        public async Task<object> Handle(UpdateClaimAndPaymentCommand command, CancellationToken cancellationToken)
        {
            var claimAndPayment = new Core.Finance.ClaimAndPayment.ClaimAndPaymentModel
            {
                Header = command.Header,
                Details = command.Details
            };

            var result = await _repository.UpdateAsync(claimAndPayment);
            financedb.Commit();
            return result;
        }
    }
}
