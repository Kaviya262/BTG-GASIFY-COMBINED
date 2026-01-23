using Core.Master.Item;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Master.Item.UpdateItem
{
    public class UpdateItemCommand : IRequest<object>
    {
        public Masteritem Master { get; set; }
    }
}
