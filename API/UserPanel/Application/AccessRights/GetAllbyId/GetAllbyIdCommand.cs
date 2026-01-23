using MediatR;

namespace Application.AccessRights.GetAllbyId
{
   
    public class GetAllByIdCommand : IRequest<object>
    {
        public int Id { get; set; }   

        public GetAllByIdCommand(int id)
        {
            Id = id;
        }
    }
}
