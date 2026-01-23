using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Order.UpdateOrderItem;
using Core.Abstractions;
using Core.OrderMng.PackingAndDO;
using Core.OrderMng.SaleOrder;
using MediatR;
using UserPanel.Core.Abstractions;

namespace Application.PackingAndDO.acknowledgement
{
    public class acknowledgementCommandHandler : IRequestHandler<acknowledgementCommand, object>
    {
        private readonly IPackingAndDORepository _repository;

        private readonly IUnitOfWorkDB1 _unitOfWork;


        public acknowledgementCommandHandler(IPackingAndDORepository repository, IUnitOfWorkDB1 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }
        public async Task<object> Handle(acknowledgementCommand command, CancellationToken cancellationToken)
        {

             

            var data = await _repository.packingacknoledgement(command.ack,command.UserId);
            _unitOfWork.Commit();
            return data;

        }
    }
}








