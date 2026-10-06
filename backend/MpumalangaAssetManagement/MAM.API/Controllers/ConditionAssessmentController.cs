using log4net;
using MAM.API.Services;
using MAM.BusinessLayer.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;

namespace MAM.API.Controllers
{
    [Route("api/conditionassessment")]
    [ApiController]
    public class ConditionAssessmentController : BaseController
    {
        private static readonly ILog log = LogManager.GetLogger(typeof(UserController));

        private readonly IConditionAssessmentService _conditionAssessmentService;

        public ConditionAssessmentController(IConditionAssessmentService conditionAssessmentService)
        {
            _conditionAssessmentService = conditionAssessmentService;
            // log4net configured at application startup
        }

        [HttpGet]
        [Route("getconditionassessments/{facilityId}")]
        public IActionResult GetConditionAssessments(int facilityId)
        {
            List<ConditionAssessment> conditionsAssessments = _conditionAssessmentService.GetConditionAssessments(facilityId);
            return Ok(conditionsAssessments);
        }

        [HttpPost]
        [Route("saveConditionAssessment")]
        public IActionResult SaveConditionAssessment(ConditionAssessment conditionAssessment)
        {
            int conditionAssessmentId = _conditionAssessmentService.AddConditionAssessment(conditionAssessment);
            return Ok(conditionAssessmentId);
        }

        [HttpDelete]
        [Route("deleteConditionAssessment/{id}")]
        public IActionResult DeleteConditionAssessment(int id)
        {
            bool isDeleted = _conditionAssessmentService.DeleteConditionAssessment(id);
            return Ok(isDeleted);
        }
    }
}
