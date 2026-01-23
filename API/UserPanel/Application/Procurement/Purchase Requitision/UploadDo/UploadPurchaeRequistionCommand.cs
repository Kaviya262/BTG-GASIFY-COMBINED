using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace Application.Procurement.Purchase_Requitision.UploadDo
{
    public  class UploadPurchaeRequistionCommand : IRequest<object>
    {
        public Int32 Id { get; set; }
        public string Path { get; set; }
        public Int32 UserId { get; set; }
        public Int32 BranchId { get; set; }
        public string filename { get; set; }
    }
}
