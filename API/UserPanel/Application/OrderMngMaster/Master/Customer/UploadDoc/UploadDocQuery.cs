using Core.Models;
using MediatR;

namespace Application.PackingAndDO.UploadPackingAndDO
{
    public class UploadDocQuery : IRequest<ResponseModel>
    {
        public Int32 Id { get; set; }
        public string Path { get; set; }
        public int UserId { get; set; }
        public int BranchId { get; set; }
    }
}