using Application.Procurement.Master.Supplier.GetAllCurrency;
using Core.Master.Supplier;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Master.Supplier.GetAllState
{
    public class GetAllStateCommandHandler : IRequestHandler<GetAllStateCommand,object>
    {
        private readonly ISupplierMasterRepository _repository;

        public GetAllStateCommandHandler(ISupplierMasterRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetAllStateCommand request, CancellationToken cancellationToken)
        {
            return await _repository.GetStateList(request.branchid, request.orgid);
        }
    }
}
