using Application.Procurement.Master.Supplier.CreateSupplier;
using Core.Abstractions;
using Core.Master.Supplier;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Master.Supplier.UpdateSupplier
{
    public class UpdateSupplierCommandHandler : IRequestHandler<UpdateSuppliercommand, object>
    {
        private readonly ISupplierMasterRepository _repository;
        private readonly IUnitOfWorkDB4 _unitOfWork;

        public UpdateSupplierCommandHandler(ISupplierMasterRepository repository, IUnitOfWorkDB4 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<object> Handle(UpdateSuppliercommand command, CancellationToken cancellationToken)
        {
            SupplierMaster Items = new SupplierMaster();
            Items.Master = command.Master;
            Items.Currency = command.Currency;

            var data = await _repository.UpdateAsync(Items);
            _unitOfWork.Commit();
            return data;


        }
    }
}
