using Application.Procurement.Goods_Receipt_Note.GetGrnSupplierAutoComplete;
using Core.Procurement.GoodsReceiptNote;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Goods_Receipt_Note.GetGrnNoAutoComplete
{
    public class GetGrnNoAutoCompleteQueryHandler : IRequestHandler<GetGrnNoAutoCompleteQuery, object>
    {
        private readonly IGoodsReceiptNoteRepository _repository;
        public GetGrnNoAutoCompleteQueryHandler(IGoodsReceiptNoteRepository repository)
        {
            _repository = repository;
        }

        public async Task<object> Handle(GetGrnNoAutoCompleteQuery command, CancellationToken cancellationToken)
        {
            var Result = await _repository.GetGrnNoAutoComplete(command.branchid, command.orgid, command.grnno);
            return Result;
        }
    }
}
