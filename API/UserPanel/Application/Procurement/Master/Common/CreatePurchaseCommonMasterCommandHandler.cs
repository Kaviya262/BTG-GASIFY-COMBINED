using Application.Procurement.Master.Common;
using Core.Abstractions;
using Core.Models;
using Core.OrderMng.Quotation;
using Core.OrderMngMaster.Common;
using Core.Procurement.Master;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UserPanel.Core.Abstractions;

namespace Application.OrderMngMaster.Common
{
    public class CreatePurchaseCommonMasterCommandHandler : IRequestHandler<CreatePurchaseCommonMasterCommand, object>
    {
        private readonly IPurchaseMasterRepository _repository;
        private readonly IUnitOfWorkDB1 _unitOfWork;

        public CreatePurchaseCommonMasterCommandHandler(IPurchaseMasterRepository repository, IUnitOfWorkDB1 unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;

        }

        public async Task<object> Handle(CreatePurchaseCommonMasterCommand command, CancellationToken cancellationToken)
        {
            if (command.opt == 1)
            {
                var Result = await _repository.GetUserDetails(command.branchid,command.searchtext,command.orgid,command.Id);
                return Result;
            }
            if (command.opt == 2)
            {
                var Result = await _repository.GetDepartMentDetails(command.branchid, command.searchtext, command.orgid, command.Id);
                return Result;
            }
            if (command.opt == 3)
            {
                var Result = await _repository.GetPurchaseTypeDetails(command.branchid, command.searchtext, command.orgid, command.Id);
                return Result;
            }
            if (command.opt == 4)
            {
                var Result = await _repository.GetUomDetails(command.branchid, command.searchtext, command.orgid, command.Id);
                return Result;
            }
            if (command.opt == 5)
            {
                var Result = await _repository.GetItemDetails(command.branchid, command.searchtext, command.orgid, command.Id,command.groupid);
                return Result;
            }
            if (command.opt == 6)
            {
                var result = await _repository.GetPRType(command.branchid, command.searchtext, command.orgid, command.Id);
                return result;
            }
            if(command.opt == 7)
            {
                var result = await _repository.GetSupplierDetails(command.branchid, command.searchtext, command.orgid, command.Id);
                return result;
            }
            if (command.opt == 8)
            {
                var result = await _repository.GetPaymentTermsDetails(command.branchid, command.searchtext, command.orgid, command.Id);
                return result;
            }
            if(command.opt == 9)
            {
                var result = await _repository.GetDeliveryTermsDetails(command.branchid, command.searchtext, command.orgid, command.Id);
                return result;
            }
            if (command.opt == 10)
            {
                var result = await _repository.GetItemGroup(command.branchid, command.searchtext, command.orgid, command.Id);
                return result;
            }
            if (command.opt == 13)
            {
                var result = await _repository.GetPOSupplierDetails(command.branchid, command.searchtext, command.orgid, command.Id);
                return result;
            }
            else
            {
                return new ResponseModel()
                {
                    Data = null,
                    Message = "No record found",
                    Status = false
                };
            }

        }
    }
}
