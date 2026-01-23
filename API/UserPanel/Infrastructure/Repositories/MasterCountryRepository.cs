//using System.Data;
//using BackEnd.Master;
//using Core.Models;
//using Dapper;
//using UserPanel.Infrastructure.Data;

//namespace Infrastructure.Repositories
//{
//    public class MasterCountryRepository : IMasterCountryRepository
//    {
//        private readonly IDbConnection _connection;
//        public MasterCountryRepository(IUnitOfWorkDB1 unitOfWork)
//        {
//            _connection = connectionFactory.CreateConnection();
//        }

//        public async Task<object> GetAllAsync(int opt)
//        {
//            try
//            {
//                var param = new DynamicParameters();
//                param.Add("@opt", opt);

//                var List = await _connection.QueryAsync(MasterCountryMaster.MasterCountryProcedure, param: param, commandType: CommandType.StoredProcedure);
//                var Modellist = List.ToList();

//                return new ResponseModel()
//                {
//                    Data = Modellist,
//                    Message = "Success",
//                    Status = true
//                };
//            }
//            catch (Exception ex)
//            {
//                return new ResponseModel()
//                {
//                    Data = null,
//                    Message = "Something went wrong - " + ex.Message,
//                    Status = false
//                };
//            }
//        }
//    }
//}
