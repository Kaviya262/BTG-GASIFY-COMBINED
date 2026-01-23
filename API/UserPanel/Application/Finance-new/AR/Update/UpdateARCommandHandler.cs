 
using Application.Financenew.AR.Update;
using Core.Abstractions;

using Core.Finance_new;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Finance.AR.Update
{
    public class UpdateARCommandHandler : IRequestHandler<UpdateARCommand, object>
    {
        private readonly IAccountsReceivableRepository _repository;
        private readonly IUnitOfWorkDB3 financedb;

        public UpdateARCommandHandler(IAccountsReceivableRepository repository, IUnitOfWorkDB3 _financedb)
        {
            _repository = repository;
             financedb = _financedb;
        }

        public async Task<object> Handle(UpdateARCommand command, CancellationToken cancellationToken)
        {
           
            var result = await _repository.UpdateReceiptsAsync(command.orgId,command.branchId,command.userId,command.userIp, command.Header);
            financedb.Commit();
            return result;
        }
    }
}
