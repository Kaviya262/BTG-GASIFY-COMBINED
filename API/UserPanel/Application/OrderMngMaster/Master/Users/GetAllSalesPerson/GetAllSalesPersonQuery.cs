using MediatR;

namespace Application.Master.Users.GetAllSalesPerson
{
    public class GetAllSalesPersonQuery : IRequest<object>
    {
        public int opt = 1;
    }
}
