using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Procurement.Master.Item.CreateItem;
using Core.Abstractions;
using Core.Master.Claim;
using MediatR;

namespace Application.Procurement.Master.CreateClaimPayment
{
    public class CreateClaimPaymentCommandhandler : IRequestHandler<CreateClaimPaymentCommand, object>
    {
        private readonly IClaimDescriptionRepository _repository;
        private readonly IUnitOfWorkDB3 _unitOfWork;

        public CreateClaimPaymentCommandhandler(IClaimDescriptionRepository repository, IUnitOfWorkDB3 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<object> Handle(CreateClaimPaymentCommand command, CancellationToken cancellationToken)
        {
            ClaimDescriptionPayment Items = new ClaimDescriptionPayment();
            Items.payment = command.payment;

            var data = await _repository.AddAsync(Items);
            _unitOfWork.Commit();
            return data;

        }
    }
}
