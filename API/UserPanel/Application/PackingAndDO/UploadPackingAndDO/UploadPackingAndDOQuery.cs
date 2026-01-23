using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.Models;
using Core.Shared;
using MediatR;

namespace Application.PackingAndDO.UploadPackingAndDO
{
    public class UploadPackingAndDOQuery : IRequest<ResponseModel>
    {
        public Int32 Id { get; set; }
        public string Path { get; set; }
    }
}