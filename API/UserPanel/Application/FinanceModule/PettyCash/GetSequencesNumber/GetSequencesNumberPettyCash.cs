using MediatR;

namespace Application.Finance.PettyCash.GetSequencesNumber
{
    public class GetSequencesNumberPettyCash : IRequest<object>
    {
        public int BranchId { get; set; }
        public int orgid { get; set; }
        public int userid { get; set; }
    }
}
