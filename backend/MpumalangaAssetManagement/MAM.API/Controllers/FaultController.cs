using log4net;
using MAM.API.Services;
using MAM.BusinessLayer.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http.Headers;

namespace MAM.API.Controllers
{
    [Route("api/fault")]
    [ApiController]
    public class FaultController : BaseController
    {
        [HttpGet]
        public IActionResult Index()
        {
            return View();
        }

        private static readonly ILog log = LogManager.GetLogger(typeof(FaultController));

        private IFaultService _faultService;

        public FaultController(IFaultService FaultService)
        {
            _faultService = FaultService;
            SetLog4NetConfiguration();
        }

        [HttpGet]
        [Route("getfaults")]
        public IActionResult GetFaults()
        {
            try
            {
                List<Fault> faults = _faultService.GetFaults();
                return Ok(faults);
            }
            catch (Exception ex)
            {
                log.Info("Error");
                throw ex;
            }
        }

        [HttpPost]
        [Route("addfault")]
        public IActionResult AddFault([FromBody] Fault fault)
        {
            try
            {
                int id = _faultService.AddFault(fault);
                return Ok(id);
            }
            catch (Exception ex)
            {
                log.Error(ex);
                throw ex;
            }
        }

        [HttpGet]
        [Route("getfaultbyreferenceno/{referenceNo}")]
        public IActionResult GetFaultByReferenceNo(string referenceNo)
        {
            try
            {
                Fault fault = _faultService.GetFaultByReferenceNo(referenceNo);
                return Ok(fault);
            }
            catch (Exception ex)
            {
                log.Error(ex);
                throw ex;
            }
        }

        [HttpPost]
        [Route("updatefault")]
        public IActionResult UpdateFault([FromBody] Fault fault)
        {
            try
            {
                bool isUpdated = _faultService.UpdateFault(fault);
                return Ok(isUpdated);
            }
            catch (Exception ex)
            {
                log.Error(ex);
                throw ex;
            }
        }

        [HttpPost]
        [Route("deletefault")]
        public IActionResult DeletFault([FromBody]Fault fault)
        {
            try
            {
                fault.IsDeleted = true;
                bool isUpdated = _faultService.DeleteFault(fault);
                return Ok(isUpdated);
            }
            catch (Exception ex)
            {
                log.Error(ex);
                throw ex;
            }
        }    

    [HttpGet]
    [Route("getFiles/{fileReference}")]
    public IActionResult GetFiles(string fileReference)
    {
        var pathToSave = Directory.GetCurrentDirectory();
        var fullPath = Path.Combine(pathToSave, "Uploads", "Faults");
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
                //fileName = fileName + '_' + i;
                var oFileName = ContentDispositionHeaderValue.Parse(file.ContentDisposition).FileName.Trim('"');
                string _fileName = fileName + "_" + i + Path.GetExtension(oFileName);
                var folderName = Path.Combine("Uploads", "Faults");
                var pathToSave = Path.Combine(Directory.GetCurrentDirectory(), folderName);

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
        catch (Exception ex)
        {
                log.Error(ex);
                throw ex;
        }

        isUploaded = true;
        return Ok(isUploaded);
    }
}
}
