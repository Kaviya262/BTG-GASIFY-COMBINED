using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Shared;
using MediatR;

namespace Application.PackingAndDO.UploadAck
{
    public class UploadPackingACKQuery : IRequest<object>
    {
        public Int32 Id { get; set; }
        public string Path { get; set; }
        public string FileName { get; set; }
        public int UserId { get; set; }
    }
}