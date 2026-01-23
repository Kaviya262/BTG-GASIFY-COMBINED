//using Application.PackingAndDO.UpdatePackingAndDO;

//namespace application.packinganddo.updatepackinganddo
//{
//    public class updatepackinganddocommandhandler : irequesthandler<UpdatePackingAndDOCommand, object>
//    {
//        private readonly ipackinganddorepository _repository;

//        private readonly iunitofworkdb1 _unitofwork;


//        public updatepackinganddocommandhandler(ipackinganddorepository repository, iunitofworkdb1 unitofwork)
//        {
//            _repository = repository;
//            _unitofwork = unitofwork;
//        }
//        public async task<object> handle(UpdatePackingAndDOCommand command, cancellationtoken cancellationtoken)
//        {

//            packinganddoitems packingitems = new packinganddoitems();
//            packingitems.details = command.details;
//            packingitems.header = command.header;
//            packingitems.sodtl = command.sodtl;
//            packingitems.customers = command.customers;
//            packingitems.gasdtl = command.gasdtl;
//            var data = await _repository.updateasync(packingitems);
//            _unitofwork.commit();
//            return data;

//        }
//    }
//}








