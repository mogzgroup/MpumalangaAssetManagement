using log4net;
using MAM.API.Services;
using MAM.BusinessLayer.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;

namespace MAM.API.Controllers
{
    [Route("api/project")]
    [ApiController]
    public class ProjectController : BaseController
    {
        [HttpGet]
        public IActionResult Index()
        {
            return View();
        }

        private static readonly ILog log = LogManager.GetLogger(typeof(ProjectController));

        private IProjectService _projectService;
        private IFacilityService _facilityService;

        public ProjectController(IProjectService projectService, IFacilityService facilityService)
        {
            _projectService = projectService;
            _facilityService = facilityService;
            // log4net is configured at application startup; no per-controller configuration required.
        }

        [HttpGet]
        [Route("getprojects")]
        public IActionResult GetProjects()
        {
            List<Project> projects = _projectService.GetProjects();
            return Ok(projects);
        }

        [HttpGet]
        [Route("getproperties")]
        public IActionResult GetProperties()
        {
            List<Facility> facilities = _facilityService.GetBuildings();
            return Ok(facilities);
        }

        [HttpPost]
        [Route("addproject")]
        public IActionResult AddProject([FromBody] Project project)
        {
            int id = _projectService.AddProject(project);
            return Ok(id);
        }

        [HttpPost]
        [Route("updateproject")]
        public IActionResult UpdateProject([FromBody] Project project)
        {
            project = _projectService.UpdateProject(project);
            return Ok(project);
        }

        [HttpPost]
        [Route("deleteproject")]
        public IActionResult DeletProject([FromBody]Project project)
        {
            bool isUpdated = _projectService.DeleteProject(project);
            return Ok(isUpdated);
        }
    }
}
