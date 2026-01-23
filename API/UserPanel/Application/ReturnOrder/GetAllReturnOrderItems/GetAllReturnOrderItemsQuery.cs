using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace UserPanel.Application.ReturnOrder.GetAllReturnOrderItems;

public class GetAllReturnOrderItemsQuery : IRequest<object>
{
    public int gascodeid { get; set; }
    public int customerid { get; set; }
    public string from_date { get; set; }
    public string to_date { get; set; }
    public Int32 BranchId { get; set; }


}









