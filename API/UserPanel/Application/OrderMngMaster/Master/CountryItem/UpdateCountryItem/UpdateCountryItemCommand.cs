using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Master.Country;
using MediatR;

namespace Application.Master.CountryItem.UpdateCountryItem
{
    public class UpdateCountryItemCommand : IRequest<object>
    {
        public CountryItemHeader Header { get; set; }
        public Int32 CountryId { get; set; }
    }
}
