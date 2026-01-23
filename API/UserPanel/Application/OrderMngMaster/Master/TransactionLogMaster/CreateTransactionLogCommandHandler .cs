using Core.Master.Transactionlog;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.OrderMngMaster.Master.TransactionLogMaster
{
    public class CreateTransactionLogCommandHandler : IRequestHandler<CreateTransactionLogCommand, object>
    {
        private readonly IUserTransactionLogRepository _repository;

        public CreateTransactionLogCommandHandler(IUserTransactionLogRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(CreateTransactionLogCommand request, CancellationToken cancellationToken)
        {
            var result = await _repository.LogTransactionAsync(request.TransactionLog);
            return result;
        }
    }
}
