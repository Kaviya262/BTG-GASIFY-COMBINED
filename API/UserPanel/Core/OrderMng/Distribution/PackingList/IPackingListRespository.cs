namespace Core.OrderMng.Distribution.PackingList
{
    public interface IPackingListRepository
    {
        Task<object> GetAll(int? searchBy, int? customerId, int? gasCodeId, int? branchId);

        Task<object> AddAsync(string Barcodes, int PackingDetailsId, int PackingId, int RackId,bool isSubmitted,int userId,string packNo);
        Task<object> GetAllExportAsync(Int32 BranchId);
        Task<object> GetByIdBarcode(int BranchId, int PackingId, int PackingDetailsId);
    }
}
