using Application.Procurement.Purchase_Requitision.GetSupplierCurrency;
using Core.Procurement.PurchaseRequisition;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Purchase_Requitision.GetPurchaseMemoList
{
    public class GetPurchaseMemoListQueryHandler : IRequestHandler<GetPurchaseMemoListQuery , object>
    {
        private readonly IPurchaseRequisitionRepository _repository;

        public GetPurchaseMemoListQueryHandler(IPurchaseRequisitionRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetPurchaseMemoListQuery command, CancellationToken cancellationToken)
        {

            var Result = await _repository.GetMemoList(command.branchid, command.orgid,command.id);
            return Result;

        }
    }
}
