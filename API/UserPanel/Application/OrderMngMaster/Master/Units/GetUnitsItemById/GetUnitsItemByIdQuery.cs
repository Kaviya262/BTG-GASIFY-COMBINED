using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;
using static Core.Master.Units.UnitsItem;

namespace Application.Master.Units.GetUnitsItemById
{
    public class GetUnitsItemByIdQuery : IRequest<object>
    {
        public UnitsItemHeader Header { get; set; }

        public int Id { get; set; }
        public string SearchCode {  get; set; }
    }
}
