using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Master.Country;
using MediatR;

namespace Application.Master.CountryItem.GetAllCountryItem
{
    public class GetAllCountryItemQuery : IRequest<object>
    {
        public CountryItemHeader Header { get; set; }
        public string CountryCode { get; set; }
        public string CountryName { get; set; }
    }
}
