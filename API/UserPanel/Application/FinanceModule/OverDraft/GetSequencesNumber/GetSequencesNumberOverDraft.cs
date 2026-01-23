using MediatR;

namespace Application.FinanceModule.OverDraft.GetSequencesNumber
{
    public class GetSequencesNumberOverDraft : IRequest<object>
    {
        public int BranchId { get; set; }
        public int orgid { get; set; }
        public int userid { get; set; }
    }
}
