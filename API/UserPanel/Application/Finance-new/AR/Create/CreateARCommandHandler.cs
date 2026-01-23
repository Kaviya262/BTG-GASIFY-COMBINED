using Application.Financenew.AR.Create;
using Core.Abstractions;
using Core.Finance_new;
using MediatR;

namespace Application.Financenew.AR.Create
{
    public class CreateRCommandHandler : IRequestHandler<CreateARCommand, object>
    {
        private readonly IAccountsReceivableRepository _repository;
        private readonly IUnitOfWorkDB3 financedb;


        public CreateRCommandHandler(IAccountsReceivableRepository repository, IUnitOfWorkDB3 _financedb)
        {
            _repository = repository;
            financedb = _financedb;

        }

        public async Task<object> Handle(CreateARCommand command, CancellationToken cancellationToken)
        {
           
            var data = await _repository.InsertFromInvoiceAsync(command.orgId,command.branchId,command.userId,command.userIp,command.invoiceId,command.typeid);
                financedb.Commit();
             
            //_financedb.Commit();
            return data;

        }
    }
}

