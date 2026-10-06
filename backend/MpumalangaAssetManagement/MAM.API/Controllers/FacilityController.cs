using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http.Headers;
using log4net;
using MAM.API.Services;
using MAM.BusinessLayer.Models;
using MAM.BusinessLayer.Models.Enums;
using Microsoft.AspNetCore.Mvc;

namespace MAM.API.Controllers
{
    [Route("api/facility")]
    [ApiController]
    public class FacilityController : BaseController
    {
        private static readonly ILog log = LogManager.GetLogger(typeof(FacilityController));

        private IFacilityService _facilityService;
        private readonly UploadStorage _uploadStorage;

        public FacilityController(IFacilityService facilityService, UploadStorage uploadStorage)
        {
            _facilityService = facilityService;
            _uploadStorage = uploadStorage;
            // log4net configured at application startup
        }

        [HttpGet]
        [Route("getfacilityzonings")]
        public IActionResult GetFacilityZonings()
        {
            List<FacilityType> facilityTypes = _facilityService.GetFacilityZonings();
            return Ok(facilityTypes);
        }

        [HttpGet]
        [Route("getdashboardwedges")]
        public IActionResult GetDashboardWedges()
        {
            List<DashboardWedge> dashboardWedges = _facilityService.GetDashboardWedges();
            return Ok(dashboardWedges);
        }

        [HttpGet]
        [Route("getfacilitysummaries")]
        public IActionResult GetFacilitySummaries()
        {
            List<FacilitySummaryChart> dashboardWedges = _facilityService.GetFacilitySummaries();
            return Ok(dashboardWedges);
        }

        [HttpGet]
        [Route("getmapcoordinates")]
        public IActionResult GetMapCoordinates()
        {
            List<MapCoordinate> mapCoordinates = _facilityService.GetMapCoordinates();
            return Ok(mapCoordinates);
        }

        [HttpGet]
        [Route("getproperties/{userDepartment}")]
        public IActionResult GetProperties(string userDepartment)
        {
            List<Facility> facilities = _facilityService.GetProperties(userDepartment);
            return Ok(facilities);
        }

        [HttpGet]
        [Route("getbuildings/{town}")]
        public IActionResult GetBuildingsByTown(string town)
        {
            List<Facility> facilities = _facilityService.GetBuildingsByTown(town);
            return Ok(facilities);
        }

        [HttpGet]
        [Route("getallfacilities")]
        public IActionResult GetAllFacilities()
        {
            List<Facility> facilities = _facilityService.GetAllFacilities();
            return Ok(facilities);
        }

        [HttpGet]
        [Route("gettowns")]
        public IActionResult GetTowns()
        {
            List<string> towns = _facilityService.GetTowns();
            return Ok(towns);
        }

        [HttpGet]
        [Route("getassetregisterfacilities")]
        public IActionResult GetAssetRegisterFacilities()
        {
            List<Facility> facilities = _facilityService.GetAssetRegisterFacilities();
            return Ok(facilities);
        }

        [HttpGet]
        [Route("getFacilityByCode/{id}/{facilityType}")]
        public IActionResult GetFacilityById(int id, FacilityTypes facilityType)
        {
            Facility facility = _facilityService.GetFacilityById(id, facilityType);
            if (facility == null)
                return NotFound();

            return Ok(facility);
        }

        [HttpDelete]
        [Route("deleteFacility/{id}")]
        public IActionResult DeleteFacility(int id)
        {
            return Ok(_facilityService.DeleteFacility(id));
        }

        [HttpPost]
        [Route("updateFacility/{step}")]
        public IActionResult UpdateFacility(string step, Facility facility)
        {
            return Ok(_facilityService.UpdateFacility(step, facility));
        }

        [HttpPost]
        [Route("saveFacility/{step}")]
        public IActionResult SaveFacility(string step, Facility facility)
        {
            facility = _facilityService.SaveFacility(step, facility);
            return Ok(facility);
        }

        [HttpGet]
        [Route("getFiles/{fileReference}")]
        public IActionResult GetFiles(string fileReference)
        {
            var fullPath = _uploadStorage.GetDirectory("Facilities");
            var files = Directory.GetFiles(fullPath).Where(f => f.Contains(fileReference)).ToList();
            return Ok(files);
        }

        [HttpPost, DisableRequestSizeLimit]
        [Route("uploadFiles/{fileName}")]
        public IActionResult UploadFiles(string fileName)
        {

            bool isUploaded = false;

            try
            {
                for (int i = 0; i < Request.Form.Files.Count(); i++)
                {
                    var file = Request.Form.Files[i];
                    var oFileName = ContentDispositionHeaderValue.Parse(file.ContentDisposition).FileName.Trim('"');
                    string _fileName = fileName + "_" + i + Path.GetExtension(oFileName);
                    var folderName = Path.Combine("Uploads", "Facilities");
                    var pathToSave = _uploadStorage.GetDirectory("Facilities");

                    if (file.Length > 0)
                    {
                        var fullPath = Path.Combine(pathToSave, _fileName);
                        var dbPath = Path.Combine(folderName, _fileName);
                        using (FileStream stream = new FileStream(fullPath, FileMode.Create))
                        {
                            file.CopyTo(stream);
                        }
                    }
                    else
                    {
                        return BadRequest();
                    }
                }
            }
            catch (Exception)
            {
                throw;
            }

            isUploaded = true;
            return Ok(isUploaded);
        }
    }
}