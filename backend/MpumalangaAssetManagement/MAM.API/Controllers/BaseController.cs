using Microsoft.AspNetCore.Mvc;
using System.Reflection;
using System.Xml;

namespace MAM.API.Controllers
{
    public class BaseController : Controller
    {
        private static bool _log4netConfigured = false;

        public static void SetLog4NetConfiguration()
        {
            if (_log4netConfigured)
                return;

            try
            {
                var configPath = System.IO.Path.Combine(System.IO.Directory.GetCurrentDirectory(), "log4net.config");
                if (!System.IO.File.Exists(configPath))
                    return;

                XmlDocument log4netConfig = new XmlDocument();
                using (var stream = System.IO.File.OpenRead(configPath))
                {
                    log4netConfig.Load(stream);
                }

                var repository = Assembly.GetEntryAssembly() != null
                    ? log4net.LogManager.GetRepository(Assembly.GetEntryAssembly())
                    : log4net.LogManager.GetRepository();

                log4net.Config.XmlConfigurator.Configure(repository, log4netConfig["log4net"]);
                _log4netConfigured = true;
            }
            catch
            {
                // Do not bubble logging configuration failures to callers.
                // If log4net cannot be configured, application should continue running.
            }
        }
    }
}
