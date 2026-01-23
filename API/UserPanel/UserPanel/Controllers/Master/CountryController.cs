using Application.Master.CountryItem.CreateCountryItem;
using Application.Master.CountryItem.GetAllCountryItem;
using Application.Master.CountryItem.GetCountryByCode;
using Application.Master.CountryItem.GetCountryByName;
using Application.Master.CountryItem.GetCountryItemById;
using Application.Master.CountryItem.UpdateCountryItem;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace UserPanel.Controllers.Master.Country
{

    [Route("api/[controller]")]
    [ApiController]
    public class CountryController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CountryController(IMediator mediator)
        {
            _mediator = mediator;
        }
        #region CreateCountry
        [HttpPost("create")] // Insert
        public async Task<ActionResult<object>> CreateCountry([FromBody] CreateCountryItemCommand command)
        {
            if (command == null)
            {
                return BadRequest(new { message = "Data Empty!!" });
            }
            var countryId = await _mediator.Send(command);

            return Ok(countryId);
            // return CreatedAtAction(nameof(GetCountryById),
            //   new { id = countryId }, new { message = "Added List!", data = command });

        }
        #endregion
        #region GetAllCountries
        [HttpGet("get-all")]
        public async Task<ActionResult<IEnumerable<object>>> GetAllCountries([FromQuery] string? conCode,
            [FromQuery] string? conName, [FromQuery] DateTime? FromDate, [FromQuery] DateTime? ToDate) //Get all 
        {


            var countries = await _mediator.Send(new GetAllCountryItemQuery
            {
                CountryCode = conCode,
                CountryName = conName
            });

            return Ok(countries);

        }
        #endregion
        #region GetCountryByCode
        [HttpGet("get-by-code/{countryCode}")]
        public async Task<ActionResult<IEnumerable<object>>> GetCountryByCode(string countryCode)
        {
            if (countryCode == null)
            {
                return NotFound(new { message = "No Code Found!" });
            }
            var countrycodes = await _mediator.Send(new GetCountryByCodeQuery { contCode = countryCode });

            return Ok(countrycodes);
        }
        #endregion
        #region GetCountryByName
        [HttpGet("name/{countryName}")]
        public async Task<ActionResult<IEnumerable<object>>> GetCountryByName(string countryName)
        {
            if (countryName == null)
            {
                return BadRequest(new { message = "No Names Found!" });
            }
            var countrynames = await _mediator.Send(new GetCountryByNameQuery { contName = countryName });

            return Ok(countrynames);

        }
        #endregion
        #region GetCountryById
        [HttpGet("{Id}")]
        public async Task<IActionResult> GetCountryById(int Id) // Get ById
        {
            if (Id == 0)
            {
                return BadRequest(new { message = "ID not found!." });
            }
            var country = await _mediator.Send(new GetCountryItemByIdQuery { Id = Id });

            return Ok(country);
        }
        #endregion

        #region UpdateCountry
        [HttpPut("update")] //Update
        public async Task<IActionResult> UpdateCountry([FromBody] UpdateCountryItemCommand command)
        {
            if (command == null)
            {
                return BadRequest(new { message = "Data Missing!" });
            }
            var existCId = await _mediator.Send(new GetCountryItemByIdQuery { Id = command.Header.CountryId });

            // command.Header.CountryId = command.CountryId;
            if (existCId == null)
            {
                return NotFound(new { message = "Given Id not Found!" });
            }
            var result = await _mediator.Send(command);

            return Ok(result);

        }

        #endregion


    }
}