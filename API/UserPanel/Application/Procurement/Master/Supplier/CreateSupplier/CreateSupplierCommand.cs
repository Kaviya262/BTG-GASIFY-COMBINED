using Core.Master.Supplier;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Procurement.Master.Supplier.CreateSupplier
{
    public class CreateSupplierCommand : IRequest<object>
    {
        public supplier Master { get; set; }
        public List<SupplierCurrency> Currency { get; set; }
    }
}
