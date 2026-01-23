using Application.Procurement.Master.Item.UpdateItem;
using Core.Abstractions;
using Core.Master.Item;
using DocumentFormat.OpenXml.Office.Word;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Master.Item.UpdateItemStatus
{
    public class UpdateItemStatusCommandHandler : IRequestHandler<UpdateItemStatusCommand, object>
    {
        private readonly IItemMasterRepository _repository;
        private readonly IUnitOfWorkDB4 _unitOfWork;

        public UpdateItemStatusCommandHandler(IItemMasterRepository repository, IUnitOfWorkDB4 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<object> Handle(UpdateItemStatusCommand command, CancellationToken cancellationToken)
        {
            var item = await _repository.UpdateItemStatus(command.orgid, command.branchid, command.itemid,command.isactive,command.userid);          
            _unitOfWork.Commit();
            return item;

        }
    }
}
