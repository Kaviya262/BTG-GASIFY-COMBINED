using Core.Master.Item;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Procurement.Master
{
    public interface IProjectRepository
    {
        Task<object> GetListProjectAsync(string projectcode, string projectname, int userid, int branchid, int orgid);

        Task<object> AddAsync(MasterProject proj);

        Task<object> UpdateAsync(MasterProject proj);

        Task<object> GetProjectByIdAsync( int projectid, int branchid, int orgid);
    }
}
