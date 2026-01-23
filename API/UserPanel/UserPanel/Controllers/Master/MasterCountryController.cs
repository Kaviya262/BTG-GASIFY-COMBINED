//using Application.OrderMngMaster.Master.Country.GetAllCountry;
//using MediatR;
//using Microsoft.AspNetCore.Mvc;

//namespace UserPanel.Controllers.Master
//{
//    [Route("api/[controller]")]
//    [ApiController]
//    public class MasterCountryController : ControllerBase
//    {
//        private readonly IMediator _mediator;

//        public MasterCountryController(IMediator mediator)
//        {
//            _mediator = mediator;
//        }

//        [HttpGet("GetALLCountry")]
//        public async Task<IActionResult> GetALLCountry()
//        {
//            var result = await _mediator.Send(new GetAllCountryQuery());
//            return Ok(result);
//        }
//    }
//}
