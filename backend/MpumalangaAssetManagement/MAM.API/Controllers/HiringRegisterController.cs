using log4net;
using MAM.API.Services;
using MAM.BusinessLayer.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;

namespace MAM.API.Controllers
{
    [Route("api/hiringregister")]
    [ApiController]
    public class HiringRegisterController : BaseController
    {
        [HttpGet]
        public IActionResult Index()
        {
            return View();
        }

        private static readonly ILog log = LogManager.GetLogger(typeof(HiringRegisterController));

        private IHiringRegisterService _hiringRegisterService;

        public HiringRegisterController(IHiringRegisterService hiringRegisterService)
        {
            _hiringRegisterService = hiringRegisterService;
            // log4net configured at application startup
        }

        [HttpGet]
        [Route("gethiredproperties")]
        public IActionResult GetHiredProperties()
        {
            List<HiredProperty> properties = _hiringRegisterService.GetHiredProperties();
            return Ok(properties);
        }

        [HttpPost]
        [Route("addhiredproperty")]
        public IActionResult AddHiredProperty([FromBody] HiredProperty hiredProperty)
        {
            int id = _hiringRegisterService.AddHiredProperty(hiredProperty);
            return Ok(id);
        }

        [HttpPost]
        [Route("updatehiredproperty")]
        public IActionResult UpdateHiredProperty([FromBody] HiredProperty hiredProperty)
        {
            bool isUpdated = _hiringRegisterService.UpdateHiredProperty(hiredProperty);
            return Ok(isUpdated);
        }

        [HttpPost]
        [Route("deletehiredproperty")]
        public IActionResult DeletHiredProperty([FromBody]HiredProperty hiredProperty)
        {
            bool isUpdated = _hiringRegisterService.DeleteHiredProperty(hiredProperty);
            return Ok(isUpdated);
        }
    }
}
