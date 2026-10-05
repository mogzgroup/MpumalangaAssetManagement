using Microsoft.AspNetCore.Builder;
using System.IO;

namespace MAM.API
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            Directory.SetCurrentDirectory(builder.Environment.ContentRootPath);

            var startup = new Startup(builder.Configuration);

            startup.ConfigureServices(builder.Services);

            var app = builder.Build();

            startup.Configure(app, app.Environment);

            app.Run();
        }
    }
}
