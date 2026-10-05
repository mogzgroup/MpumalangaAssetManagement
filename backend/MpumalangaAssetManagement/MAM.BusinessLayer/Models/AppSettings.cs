using System;
using System.Collections.Generic;
using System.Text;

namespace MAM.BusinessLayer.Models
{
    public class AppSettings
    {
        public string Secret { get; set; }
        public string EmailUserName { get; set; }
        public string EmailPassword { get; set; }
        public string EmailHost { get; set; }
        public int EmailPot { get; set; }
        public string FromEmailAddress { get; set; }
        public string WebAppURL { get; set; }
        public string ConnectionString { get; set; }
        public string JwtIssuer { get; set; }
        public string JwtAudience { get; set; }
        public string[] AllowedOrigins { get; set; }
        public string UploadsFolder { get; set; }
    }
}
