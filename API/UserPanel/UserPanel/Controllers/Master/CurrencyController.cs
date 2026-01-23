using Application.Master.CurrencyItem.CreateCurrencyItem;
using Application.Master.CurrencyItem.GetAllCurrencyItem;
using Application.Master.CurrencyItem.GetCurrencyItemById;
using Application.Master.CurrencyItem.UpdateCurrencyItem;
using Application.OrderMngMaster.Master.CurrencyItem.UpdateCurrencyStatus;
using DocumentFormat.OpenXml.Spreadsheet;
using DocumentFormat.OpenXml.Wordprocessing;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using static Core.Master.Currency.CurrencyItem;

namespace UserPanel.Controllers.Master.Currency
{
    [Route("api/[controller]")]
    [ApiController]
    public class CurrencyController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CurrencyController(IMediator mediator)
        {
            _mediator = mediator;
        }
        #region CreateCurrency
        [HttpPost("create")] // Insert
        public async Task<ActionResult<object>> CreateCurrency([FromBody] CreateCurrencyItemCommand command)
        {
            var currencyId = await _mediator.Send(command);

            if (currencyId == null)
            {
                return BadRequest(new { message = "Failed Insert!" });
            }
            return currencyId;
            
        }
        #endregion

        #region GetAllCurrency
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetAllCurrency(string? curCode, string? curName) //Get all 
        {
           
            var currencies = await _mediator.Send(new GetAllCurrencyItemQuery
            {
                Curcode = curCode,
                CurName = curName
            });

            return Ok(currencies);
        }
        #endregion
        #region GetCurrencyById
        [HttpGet("id/{Id}")]
        public async Task<IActionResult> GetCurrencyById(int Id) // Get ById
        {
            if (Id == 0)
            {
                return NotFound(new { message = "ID not found!." });
            }
            var currency = await _mediator.Send(new GetCurrencyItemByIdQuery { Id = Id });

            return Ok(currency);
        }
        #endregion
        #region GetCurrencyByCode
        [HttpGet("code/{currencyCode}")]
        public async Task<IActionResult> GetCurrencyByCode(string currencyCode)
        {
            if (currencyCode == null)
            {
                return NotFound(new { message = "No Codes Found!" });
            }
            var codes = await _mediator.Send(new GetCurrencyItemByIdQuery { CurCode = currencyCode });

            return Ok(codes);
        }
        #endregion
        #region GetCurrencyByName
        [HttpGet("name/{currencyName}")]
        public async Task<IActionResult> GetCurrencyByName(string currencyName)
        {
            if (currencyName == null)
            {
                return NotFound(new { message = "No Names Found!" });
            }
            var cnames = await _mediator.Send(new GetCurrencyItemByIdQuery { CurName = currencyName });

            return Ok(cnames);

        }
        #endregion

        #region UpdateCurrency
        [HttpPut("update-status")] //Update
        public async Task<IActionResult> UpdateCurrencyStatus([FromBody] UpdateCurrencyStatusCommand command)
        {

            if (command == null)
            {
                return BadRequest(new { message = "No Data!" });
            }

            var existCId = await _mediator.Send(new GetCurrencyItemByIdQuery { Id = command.Detail.CurrencyId });
            if (existCId == null)
            {
                return NotFound(new { message = "Currency with given ID not found." });
            }           

            var result = await _mediator.Send(command);
            return Ok(result);

        }
        #endregion

        #region UpdateCurrency
        [HttpPut("update")] //Update
        public async Task<IActionResult> UpdateCurrency([FromBody] UpdateCurrencyItemCommand command)
        {

            if (command == null)
            {
                return BadRequest(new { message = "No Data!" });
            }

            var existCId = await _mediator.Send(new GetCurrencyItemByIdQuery { Id = command.Header.CurrencyId });
            if (existCId == null)
            {
                return NotFound(new { message = "Currency with given ID not found." });
            }

            var result = await _mediator.Send(command);


            return Ok(result);

        }
        #endregion

       


    }
}
