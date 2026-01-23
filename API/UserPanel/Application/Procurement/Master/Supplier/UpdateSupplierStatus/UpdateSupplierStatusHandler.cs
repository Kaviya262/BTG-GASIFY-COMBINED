using Application.Procurement.Master.Item.UpdateItemStatus;
using Core.Abstractions;
using Core.Master.Item;
using Core.Master.Supplier;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Master.Supplier.UpdateSupplierStatus
{
    public class UpdateSupplierStatusHandler : IRequestHandler<UpdateSupplierStatusCommand, object>
    {
        private readonly ISupplierMasterRepository _repository;
        private readonly IUnitOfWorkDB4 _unitOfWork;

        public UpdateSupplierStatusHandler(ISupplierMasterRepository repository, IUnitOfWorkDB4 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<object> Handle(UpdateSupplierStatusCommand command, CancellationToken cancellationToken)
        {
            var item = await _repository.UpdateSupplierStatus(command.orgid, command.branchid, command.supplierid, command.isactive, command.userid);
            _unitOfWork.Commit();
            return item;

        }
    }
}
