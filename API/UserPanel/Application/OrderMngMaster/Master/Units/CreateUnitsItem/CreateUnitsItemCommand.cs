using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;
using static Core.Master.Units.UnitsItem;

namespace Application.Master.Units.CreateUnitsItem
{
    public class CreateUnitsItemCommand : IRequest<object>
    {
        public UnitsItemHeader Header { get; set; }
    }
}
