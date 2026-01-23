using Application.OrderMngMaster.Master.Gas.CreateGas;
using Core.Master.ErrorLog;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.OrderMngMaster.Master.ErrorLogMaster
{
    public class CreateErrorLogCommandHandler : IRequestHandler<CreateErrorLogCommand, object>
    {
        private readonly IErrorLogMasterRepository _errorLogMaster;

        public CreateErrorLogCommandHandler(IErrorLogMasterRepository errorLogMaster)
        {
            _errorLogMaster = errorLogMaster;
        }

        public async Task<object> Handle(CreateErrorLogCommand request, CancellationToken cancellationToken)
        {
            var data = await _errorLogMaster.LogErrorAsync(request.ErrorLog);
            return data;
        }
    }
}
