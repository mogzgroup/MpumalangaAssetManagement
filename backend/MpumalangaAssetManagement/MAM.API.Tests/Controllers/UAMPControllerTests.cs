using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace MAM.API.Tests.Controllers
{
    public class UAMPControllerTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;

        public UAMPControllerTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory.WithWebHostBuilder(builder =>
            {
                builder.UseEnvironment("Test");
                builder.UseSetting("AppSettings:Secret", "test-secret-should-be-long-enough-to-meet-requirements-123456");
                builder.UseSetting("AppSettings:JwtIssuer", "MobileCentric");
                builder.UseSetting("AppSettings:JwtAudience", "MobileCentricAPI");
                builder.UseSetting("AppSettings:ConnectionString", "Server=(local);Database=Test;Trusted_Connection=True;");
                builder.UseSetting("AppSettings:WebAppURL", "https://localhost/");
                builder.UseSetting("AppSettings:UploadsFolder", "Uploads");
                builder.UseSetting("AppSettings:EmailUserName", "test");
                builder.UseSetting("AppSettings:EmailPassword", "test");
                builder.UseSetting("AppSettings:EmailHost", "smtp.test");
                builder.UseSetting("AppSettings:FromEmailAddress", "test@test.local");
            });
        }

        [Fact]
        public void ServerStarts()
        {
            var client = _factory.CreateClient();
            Assert.NotNull(client);
        }
    }
}
