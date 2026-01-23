using System.ComponentModel.DataAnnotations;
using MediatR;

namespace UserPanel.Application.OrderMngMaster.Master.Users;

public class CreateUserCommand : IRequest<object>
{
    public string userid { get; set; }
    public int? Id { get; set; }
    public string UserName { get; set; }

    public string EmailID { get; set; }

    public string MobileNo { get; set; }

    public string FirstName { get; set; }

    public string LastName { get; set; }

    public string Password { get; set; }

    public string Role { get; set; }
    public string RoleName { get; set; }
    public string Department { get; set; }

    public DateTime FromDate { get; set; }

    public DateTime ToDate { get; set; }

    public string MiddleName { get; set; }

    public string Remark { get; set; }

    public int? BranchId { get; set; }
    public int? CreatedBy { get; set; }

}


