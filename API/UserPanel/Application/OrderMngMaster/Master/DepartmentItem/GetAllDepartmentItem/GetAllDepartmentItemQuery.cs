using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;
using static Core.Master.Currency.CurrencyItem;
using static Core.Master.Department.DepartmentItem;

namespace Application.Master.DepartmentItem.GetAllDepartmentITem
{
    public class GetAllDepartmentItemQuery : IRequest<object>
    {
        public DepartmentItemHeader Header { get; set; }
        public string DepartCode { get; set; }
        public string DepartName { get; set; }
    }
}
