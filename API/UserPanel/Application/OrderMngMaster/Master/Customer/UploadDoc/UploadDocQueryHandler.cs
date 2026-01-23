using System.Data;
using Core.Models;
using Core.OrderMng.PackingAndDO;
using Core.OrderMngMaster.Customer;
using Core.Shared;
using MediatR;

namespace Application.PackingAndDO.UploadPackingAndDO
{
    public class UploadDocQueryHandler : IRequestHandler<UploadDocQuery, ResponseModel>
    {
        ExcellSheet ES = new ExcellSheet();
        private readonly IMasterCustomerRepository _repository;

        public UploadDocQueryHandler(IMasterCustomerRepository repository)
        {
            _repository = repository;
        }
        public async Task<ResponseModel> Handle(UploadDocQuery query, CancellationToken cancellationToken)
        {
            try
            {

                var result = await _repository.UploadDO(query.Id, query.Path, query.UserId, query.BranchId);

                return result;
            }
            catch (Exception ex)
            {
                return new ResponseModel
                {
                    Data = "",
                    Message = "An error occurred while uploading the file.",
                    Status = false
                };
            }
        }





    }


}