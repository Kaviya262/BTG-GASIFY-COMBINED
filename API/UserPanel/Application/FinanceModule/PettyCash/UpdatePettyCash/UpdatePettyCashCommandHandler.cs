using Core.Abstractions;
using Core.FinanceModule.PettyCash;
using MediatR;

namespace Application.FinanceModule.PettyCash.UpdatePettyCash
{
    public class UpdatePettyCashCommandHandler : IRequestHandler<UpdatePettyCashCommand, object>
    {
        private readonly IPettyCashRepository _repository;
        private readonly IUnitOfWorkDB3 _unitOfWorkDB3;

        public UpdatePettyCashCommandHandler(IPettyCashRepository repository, IUnitOfWorkDB3 unitOfWorkDB3)
        {
            _repository = repository;
            _unitOfWorkDB3 = unitOfWorkDB3;
        }
        public async Task<object> Handle(UpdatePettyCashCommand command, CancellationToken cancellationToken)
        {
            if (command == null)
                throw new ArgumentNullException(nameof(command));

            var Cash = new Core.FinanceModule.PettyCash.PettyCash();
            Cash.Header = command.Header;

            var data = await _repository.UpdateAsync(Cash);
            _unitOfWorkDB3.Commit();
            return data;

        }
    }
}
