using MediatR;

namespace UserPanel.Application.Quotation.GetQuotationSqNo
{
    public  class GetQuotationSqNoQuery : IRequest<object>
    {

        public Int32 BranchId { get; set; }

    }
}






