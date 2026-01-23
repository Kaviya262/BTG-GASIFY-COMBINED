using System.ComponentModel.DataAnnotations;
using MediatR;

namespace UserPanel.Application.OrderMngMaster.Master.UpdatePassword;

public class UpdatePasswordUserCommand : IRequest<object>
{
    public string userid { get; set; }
    public int? Id { get; set; }
    public string Password { get; set; }
    public string oldPassword { get; set; }


}


