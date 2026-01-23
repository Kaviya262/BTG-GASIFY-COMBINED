using System;
using System.Collections.Generic;
using System.Formats.Asn1;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.OrderMng.Quotation;
using MediatR;


namespace UserPanel.Application.Quotation.GetQuotationSqNo
{
    public class GetQuotationSqNoQueryHandler : IRequestHandler<GetQuotationSqNoQuery,object>
    {
        private readonly IQuotationRepository _repository;

        public GetQuotationSqNoQueryHandler(IQuotationRepository repository)
        {
            _repository = repository;
        }
        public async Task<object> Handle(GetQuotationSqNoQuery command, CancellationToken cancellationToken)
        {
            var Result = await _repository.GetBySqNoAsync(command.BranchId);
            return Result;
        }

    }
}






