using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.OrderMngMaster.Common
{
    public class CreateCommonMasterCommand : IRequest<object>
    {
        public Int32 doid { get; set; }
        public Int32 Opt { get; set; }
        public Int32 BranchId { get; set; }
        public string SearchText { get; set; }
        public Int32 customerid { get; set; }
        public Int32 contactid { get; set; }
        public Int32 currencyid { get; set; }
        public Int32 GasCodeId { get; set; }
        public Int32 GasTypeId { get; set; }
        public Int32 sqid { get; set; }
        public Int32 packingid { get; set; }
        public Int32 soid { get; set; }
        public Int32 id { get; set; }
        public Int32 PalletId { get; set; }
        public Int32 PalletTypeId { get; set; }
        public string UserId { get; set; }
        public string Barcode { get; set; }

        // New fields
        public int? PackingDetailsId { get; set; }
        public int? DeliveryDetailRefId { get; set; }
        public int? PackerId { get; set; }
        public string PDLNo { get; set; }
        public int? CustomerId { get; set; }
    }
}
