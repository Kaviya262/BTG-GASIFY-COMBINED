using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Procurement.InvoiceReceipt.GenerateInvoiceReceipt;
using Core.Abstractions;
using Core.Master.Claim;
using Core.Procurement.InvoiceReceipt;
using MediatR;

namespace Application.Procurement.Master.DescriptionStatusChange
{
    public class DescriptionStatusChangeHandler : IRequestHandler<DescriptionStatusChangeQuery, object>
    {
        private readonly IClaimDescriptionRepository _repository;
        private readonly IUnitOfWorkDB3 _unitOfWork;
        public DescriptionStatusChangeHandler(IClaimDescriptionRepository repository, IUnitOfWorkDB3 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }
        public async Task<object> Handle(DescriptionStatusChangeQuery command, CancellationToken cancellationToken)
        {
            var data = await _repository.DescriptionstatusChange(command.paymentid);
            _unitOfWork.Commit();

            return data;
        }
    }
}
