using log4net;
using MAM.API.Services;
using MAM.BusinessLayer.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;

namespace MAM.API.Controllers
{
    [Route("api/supplier")]
    [ApiController]
    public class SupplierController : BaseController
    {
        [HttpGet]
        public IActionResult Index()
        {
            return View();
        }

        private static readonly ILog log = LogManager.GetLogger(typeof(SupplierController));

        private ISupplierService _supplierService;

        public SupplierController(ISupplierService supplierService)
        {
            _supplierService = supplierService;
            SetLog4NetConfiguration();
        }

        [HttpPost]
        [Route("addsuppliers")]
        public IActionResult AddSuppliers([FromBody]List<Supplier> suppliers)
        {
            try
            {
                suppliers = _supplierService.AddSuppliers(suppliers);
                return Ok(suppliers);
            }
            catch (Exception ex)
            {
                log.Error(ex);
                throw ex;
            }
        }

        [HttpGet]
        [Route("getsuppliers")]
        public IActionResult GetSuppliers()
        {
            try
            {
                List<Supplier> suppliers = _supplierService.GetSuppliers();
                return Ok(suppliers);
            }
            catch (Exception ex)
            {
                log.Error(ex);
                throw ex;
            }
        }
    }
}
