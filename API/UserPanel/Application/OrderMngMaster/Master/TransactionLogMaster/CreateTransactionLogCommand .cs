using Core.Master.Transactionlog;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.OrderMngMaster.Master.TransactionLogMaster
{
    public class CreateTransactionLogCommand : IRequest<object>
    {
        public UserTransactionLogModel TransactionLog { get; set; }
    }
}
