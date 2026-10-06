using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using MAM.BusinessLayer.Models;
using System;
using Microsoft.Data.SqlClient;

namespace MAM.API.Controllers
{
    [ApiController]
    [Microsoft.AspNetCore.Authorization.AllowAnonymous]
    [Route("api/health/db")]
    public class HealthDbController : ControllerBase
    {
        private readonly AppSettings _appSettings;

        public HealthDbController(IOptions<AppSettings> appSettings)
        {
            _appSettings = appSettings.Value;
        }

        [HttpGet]
        public IActionResult Get()
        {
            try
            {
                // Perform a lightweight DB operation to verify connectivity
                using (var conn = new SqlConnection(_appSettings.ConnectionString))
                using (var cmd = conn.CreateCommand())
                {
                    conn.Open();
                    cmd.CommandText = "SELECT 1";
                    var res = cmd.ExecuteScalar();
                    return Ok(new { db = res != null, timestamp = DateTime.UtcNow });
                }
            }
            catch (Exception ex)
            {
                // do not expose exception details
                return StatusCode(503, new { db = false, timestamp = DateTime.UtcNow });
            }
        }
    }
}
