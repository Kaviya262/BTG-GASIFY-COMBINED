using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Master.DepartmentItem.GetDepartmentItemById;
using Application.Procurement.Master.CreateClaimPayment;
using Core.Abstractions;
using Core.Master.Claim;
using MediatR;
using static Core.Master.Department.DepartmentItem;

namespace Application.Procurement.Master.GetClaimPaymentById
{
    public class GetClaimPaymentByIdHandler : IRequestHandler<GetClaimPaymentByIdQuery, object>
    {
        private readonly IClaimDescriptionRepository _repository;
        private readonly IUnitOfWorkDB1 _unitOfWork;

        public GetClaimPaymentByIdHandler(IClaimDescriptionRepository repository, IUnitOfWorkDB1 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }
        public async Task<object> Handle(GetClaimPaymentByIdQuery query, CancellationToken cancellationToken)
        {
            if (query.Id > 0)
            {
                var data = await _repository.GetClaimDescriptionByIdAsync(3, query.Id);
                return data ?? new { };
            }
            return new { message = "Invalid Id!!" };

        }
    }
}
