using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Shared;
using MediatR;

namespace Application.PackingAndDO.DownloadPackingAndDO
{
    public class DownloadPackingAndDOQuery : IRequest<ExcelSheetItems>
    {
        public Int32 Id { get; set; }

    }
}