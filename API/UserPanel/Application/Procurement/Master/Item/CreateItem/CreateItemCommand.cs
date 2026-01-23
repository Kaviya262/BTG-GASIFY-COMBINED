using Core.Master.Item;
using Core.Master.Supplier;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Master.Item.CreateItem
{
    public class CreateItemCommand : IRequest<object>
    {
        public Masteritem Master { get; set; }
    }
}
