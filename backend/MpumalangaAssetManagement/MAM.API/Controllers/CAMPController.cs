using log4net;
using MAM.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;

namespace MAM.API.Controllers
{
    [Route("api/camp")]
    [ApiController]
    public class CAMPController : Controller
    {
        private static readonly ILog log = LogManager.GetLogger(typeof(CAMPController));

        private ICampService _campService;

        public CAMPController(ICampService campService)
        {
            _campService = campService;
        }

        [AllowAnonymous]
        [HttpGet]
        [Route("getcamps/{department}")]
        public IActionResult GetCamps(string department)
        {
            try
            {
                var result = _campService.GetCamps(department);
                return Ok(result);
            }
            catch (Exception ex)
            {
                log.Error(ex);
                throw;
            }
        }
    }
}
