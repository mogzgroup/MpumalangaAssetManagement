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
    [Route("api/leasemanagement")]
    [ApiController]
    public class LeaseManagementController : BaseController
    {
        private static readonly ILog log = LogManager.GetLogger(typeof(LeaseManagementController));

        private ILeaseManagementService _leaseManagementService;
        private readonly UploadStorage _uploadStorage;

        public LeaseManagementController(ILeaseManagementService leaseManagementService, UploadStorage uploadStorage)
        {
            _leaseManagementService = leaseManagementService;
            _uploadStorage = uploadStorage;
            // log4net configured at application startup
        }

        [HttpGet]
        [Route("getleasedproperties")]
        public IActionResult GetLeasedProperties()
        {
            try
            {
                List<LeasedProperty> properties = _leaseManagementService.GetLeasedProperties();
                return Ok(properties);
            }
            catch (Exception ex)
            {
                log.Error("Error", ex);
                throw;
            }
        }

        [HttpPost]
        [Route("getleasedpropertydetails")]
        public IActionResult GetLeasedPropertyDetails(LeasedProperty leasedProperty)
        {
            try
            {
                leasedProperty = _leaseManagementService.GetLeasedPropertyDetails(leasedProperty);
                return Ok(leasedProperty);
            }
            catch (Exception ex)
            {
                log.Error("Error", ex);
                throw;
            }
        }

        [HttpPost, DisableRequestSizeLimit]
        [Route("uploadHandoverDocuments/{fileName}")]
        public IActionResult UploadHandoverDocuments(string fileName)
        {

            bool isUploaded = false;

            try
            {
                for (int i = 0; i < Request.Form.Files.Count(); i++)
                {
                    var file = Request.Form.Files[i];
                    var oFileName = ContentDispositionHeaderValue.Parse(file.ContentDisposition).FileName.Trim('"');
                    string _fileName = fileName + "_" + i + Path.GetExtension(oFileName);
                    var folderName = Path.Combine("Uploads", "HandoverDocuments");
                    var pathToSave = _uploadStorage.GetDirectory("HandoverDocuments");

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
                log.Error("Error", ex);
                throw;
            }

            isUploaded = true;
            return Ok(isUploaded);
        }

        [HttpPost]
        [Route("deleteLeasedProperty")]
        public IActionResult DeleteLeasedProperty([FromBody]LeasedProperty leasedProperty)
        {
            try
            {
                bool isUpdated = _leaseManagementService.DeleteLeasedProperty(leasedProperty);
                return Ok(isUpdated);
            }
            catch (Exception ex)
            {
                log.Error("Error", ex);
                throw;
            }
        }

        [HttpPost, DisableRequestSizeLimit]
        [Route("uploadSnagListFiles/{fileName}")]
        public IActionResult UploadSnagListFiles(string fileName)
        {

            bool isUploaded = false;

            try
            {
                for (int i = 0; i < Request.Form.Files.Count(); i++)
                {
                    var file = Request.Form.Files[i];
                    var oFileName = ContentDispositionHeaderValue.Parse(file.ContentDisposition).FileName.Trim('"');
                    string _fileName = fileName + "_" + i + Path.GetExtension(oFileName);
                    var folderName = Path.Combine("Uploads", "SnagList");
                    var pathToSave = _uploadStorage.GetDirectory("SnagList");

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
                throw;
            }

            isUploaded = true;
            return Ok(isUploaded);
        }       
    }
}
