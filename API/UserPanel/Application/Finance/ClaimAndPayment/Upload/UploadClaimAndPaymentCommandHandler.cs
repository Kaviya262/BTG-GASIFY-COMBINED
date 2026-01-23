using Application.Finance.ClaimAndPayment.Create;
using Core.Abstractions;
using Core.Finance.ClaimAndPayment;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Finance.ClaimAndPayment.Update
{
    public class UploadClaimAndPaymentCommandHandler : IRequestHandler<UploadClaimAndPaymentCommand, object>
    {
        private readonly IClaimAndPaymentRepository _repository;
        private readonly IUnitOfWorkDB3 financedb;

        public UploadClaimAndPaymentCommandHandler(IClaimAndPaymentRepository repository, IUnitOfWorkDB3 _financedb)
        {
            _repository = repository;
             financedb = _financedb;
        }

        public async Task<object> Handle(UploadClaimAndPaymentCommand command, CancellationToken cancellationToken)
        {
           
            var result = await _repository.UploadDO(command.Id,command.Path,command.filename);
            financedb.Commit();
            return result;
        }
    }
}
