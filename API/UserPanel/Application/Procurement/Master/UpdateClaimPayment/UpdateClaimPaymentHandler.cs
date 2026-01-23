using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Procurement.Master.CreateClaimPayment;
using Core.Abstractions;
using Core.Master.Claim;
using MediatR;

namespace Application.Procurement.Master.UpdateClaimPayment
{
    public class UpdateClaimPaymentHandler : IRequestHandler<UpdateClaimPayment, object>
    {
        private readonly IClaimDescriptionRepository _repository;
        private readonly IUnitOfWorkDB3 _unitOfWork;
        public UpdateClaimPaymentHandler(IClaimDescriptionRepository repository, IUnitOfWorkDB3 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }
        public async Task<object> Handle(UpdateClaimPayment command, CancellationToken cancellationToken)
        {
            ClaimDescriptionPayment Items = new ClaimDescriptionPayment();
            Items.payment = command.payment;

            var data = await _repository.UpdateAsync(Items);
            _unitOfWork.Commit();
            return data;

        }
    }
}
