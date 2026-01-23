using Core.Abstractions;
using Core.Finance.ClaimAndPayment;
using MediatR;

namespace Application.Finance.ClaimAndPayment.Create
{
    public class CreateClaimAndPaymentCommandHandler : IRequestHandler<CreateClaimAndPaymentCommand, object>
    {
        private readonly IClaimAndPaymentRepository _repository;
        private readonly IUnitOfWorkDB3 financedb;


        public CreateClaimAndPaymentCommandHandler(IClaimAndPaymentRepository repository, IUnitOfWorkDB3 _financedb)
        {
            _repository = repository;
            financedb = _financedb;

        }

        public async Task<object> Handle(CreateClaimAndPaymentCommand command, CancellationToken cancellationToken)
        {
            ClaimAndPaymentModel obj = new ClaimAndPaymentModel();
            obj.Header = command.Header;
            obj.Details = command.Details;

            var data = await _repository.AddAsync(obj);
                financedb.Commit();
             
            //_financedb.Commit();
            return data;

        }
    }
}

