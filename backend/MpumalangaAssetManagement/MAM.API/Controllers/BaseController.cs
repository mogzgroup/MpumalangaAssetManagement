using Microsoft.AspNetCore.Mvc;
using System.Reflection;
using System.Xml;

namespace MAM.API.Controllers
{
    public class BaseController : Controller
    {
        public static void SetLog4NetConfiguration()
        {
            XmlDocument log4netConfig = new XmlDocument();
            log4netConfig.Load(System.IO.File.OpenRead("log4net.config"));
            log4net.Config.XmlConfigurator.Configure(log4net.LogManager.GetRepository(Assembly.GetEntryAssembly()), log4netConfig["log4net"]);
        }
    }
}
