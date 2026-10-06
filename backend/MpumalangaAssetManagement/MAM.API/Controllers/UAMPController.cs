using log4net;
using MAM.API.Services;
using MAM.BusinessLayer.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace MAM.API.Controllers
{
    [Route("api/uamp")]
    [ApiController]
    public class UAMPController : Controller
    {
        private static readonly ILog log = LogManager.GetLogger(typeof(UAMPController));

        private IUAMPService _uampService;       

        public UAMPController(IUAMPService uampService)
        {
            _uampService = uampService;
        }

        [AllowAnonymous]
        [HttpPost]
        [Route("test")]
        public IActionResult Test()
        {
            return Ok(true);
        }

        [AllowAnonymous]
        [HttpGet]
        [Route("getuamps/{department}")]
        public IActionResult GetUAMPs(string department)
        {
            var result = _uampService.GetUserImmovableAssetManagementPlans(department);
            return Ok(result);
        }

        [AllowAnonymous]
        [HttpGet]
        [Route("getuamptemplate/{uampId}/{templateNumber}")]
        public IActionResult GetUampTemplate(int uampId, double templateNumber)
        {
            if(templateNumber == 1)
                return Ok(_uampService.GetUAMPTempleteOne(uampId));
            if (templateNumber == 2.1)
                return Ok(_uampService.GetUAMPTempleteTwoPointOne(uampId));
            if (templateNumber == 2.2)
                return Ok(_uampService.GetUAMPTempleteTwoPointTwo(uampId));
            if (templateNumber == 3)
                return Ok(_uampService.GetUAMPTempleteThree(uampId));
            if (templateNumber == 4.1)
                return Ok(_uampService.GetUAMPTempleteFourPointOne(uampId));
            if (templateNumber == 4.2)
                return Ok(_uampService.GetUAMPTempleteFourPointTwo(uampId));
            if (templateNumber == 5.1)
                return Ok(_uampService.GetUAMPTempleteFivePointThree(uampId));
            if (templateNumber == 5.2)
                return Ok(_uampService.GetUAMPTempleteFivePointTwo(uampId));
            if (templateNumber == 5.3)
                return Ok(_uampService.GetUAMPTempleteFivePointOne(uampId));
            if (templateNumber == 6)
                return Ok(_uampService.GetUAMPTempleteSix(uampId));
            if (templateNumber == 7)
                return Ok(_uampService.GetUAMPTempleteSeven(uampId));

            return Ok(null);
        }

        [AllowAnonymous]
        [HttpGet]
        [Route("getampbyid/{id}")]
        public IActionResult GetUamp(int id)
        {
            var result = _uampService.GetUamp(id);
            return Ok(result);
        }

        [AllowAnonymous]
        [HttpGet]
        [Route("getuampwithtemplateone/{id}")]
        public IActionResult GetUampWithTemplateOne(int id)
        {
            var result = _uampService.GetUampWithTemplateOne(id);
            return Ok(result);
        }

        [AllowAnonymous]
        [HttpPost]
        [Route("saveuamp")]
        public async Task<IActionResult> SaveUserImmovableAssetManagementPlan([FromBody] UserImmovableAssetManagementPlan userImmovableAssetManagementPlan)
        {
            if (userImmovableAssetManagementPlan == null)
                return BadRequest("Payload is required");
            // Offload synchronous service work to threadpool to avoid blocking request threads
            var result = await Task.Run(() => _uampService.SaveUserImmovableAssetManagementPlan(userImmovableAssetManagementPlan));
            return Ok(result);
        }

        [AllowAnonymous]
        [HttpPost]
        [Route("startuamp")]
        public async Task<IActionResult> StartUserImmovableAssetManagementPlan([FromBody] UserImmovableAssetManagementPlan userImmovableAssetManagementPlan)
        {
            if (userImmovableAssetManagementPlan == null)
                return BadRequest("Payload is required");
            // Offload synchronous start operation to threadpool to avoid blocking request threads
            var result = await Task.Run(() => _uampService.StartUserImmovableAssetManagementPlan(userImmovableAssetManagementPlan));
            return Ok(result);
        }

    }
}
