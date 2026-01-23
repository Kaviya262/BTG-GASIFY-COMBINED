using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Procurement.PurchaseMemo;
using MediatR;

namespace Application.Procurement.Purchase_Memo.UploadDocument
{
    public class UploadCommand : IRequest<object>
    {

        public List<MemoAttachment> attachmentList { get; set; }
    }
}

