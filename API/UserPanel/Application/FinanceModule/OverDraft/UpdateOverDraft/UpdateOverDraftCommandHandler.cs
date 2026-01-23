using Core.Abstractions;
using Core.FinanceModule.OverDraft;
using MediatR;

namespace Application.FinanceModule.OverDraft.UpdateOverDraft
{
    public class UpdateOverDraftCommandHandler : IRequestHandler<UpdateOverDraftCommand, object>
    {
        private readonly IOverDraftRepository _repository;
        private readonly IUnitOfWorkDB3 _unitOfWorkDB3;

        public UpdateOverDraftCommandHandler(IOverDraftRepository repository, IUnitOfWorkDB3 unitOfWorkDB3)
        {
            _repository = repository;
            _unitOfWorkDB3 = unitOfWorkDB3;
        }
        public async Task<object> Handle(UpdateOverDraftCommand command, CancellationToken cancellationToken)
        {
            if (command == null)
                throw new ArgumentNullException(nameof(command));

            var Cash = new OverDraftModel();
            Cash.Header = command.Header;

            var data = await _repository.UpdateAsync(Cash);
            _unitOfWorkDB3.Commit();
            return data;

        }
    }
}

