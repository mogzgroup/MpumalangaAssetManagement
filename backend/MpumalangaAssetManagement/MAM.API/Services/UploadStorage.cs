using System.IO;
using MAM.BusinessLayer.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Options;

namespace MAM.API.Services
{
    public class UploadStorage
    {
        public UploadStorage(IWebHostEnvironment environment, IOptions<AppSettings> options)
        {
            RootPath = Path.GetFullPath(options.Value.UploadsFolder, environment.ContentRootPath);
            Directory.CreateDirectory(RootPath);
        }

        public string RootPath { get; }

        public string GetDirectory(params string[] segments)
        {
            var path = RootPath;
            foreach (var segment in segments)
            {
                path = Path.Combine(path, segment);
            }

            Directory.CreateDirectory(path);
            return path;
        }
    }
}
