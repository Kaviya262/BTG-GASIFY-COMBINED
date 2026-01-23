
namespace Core.Master.Cylinder
{
    public interface IMasterCylinderRepository
    {
        Task<object> AddAsync(MasterCylinder item);
        Task<object> GetByID(int id);
        Task<object> GetAllAsync(string name, string from_date, string to_date);
        Task<object> UpdateAsync(MasterCylinder item);
        Task<object> ToogleStatus(MasterCylinder item);

    }
}
