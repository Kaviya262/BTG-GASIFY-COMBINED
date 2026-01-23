using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Master.Item.Delete
{
    public class UpdateIsActiveCommand : IRequest<object>
    {
        public int ItemId { get; set; }

        public bool IsActive { get; set; }
    }
}
