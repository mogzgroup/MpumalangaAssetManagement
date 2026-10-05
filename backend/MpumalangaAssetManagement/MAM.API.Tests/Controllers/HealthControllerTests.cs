using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace MAM.API.Tests.Controllers
{
    public class HealthControllerTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;

        public HealthControllerTests(WebApplicationFactory<Program> factory)
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

                builder.ConfigureAppConfiguration((context, conf) =>
                {
                    var dict = new System.Collections.Generic.Dictionary<string, string?>
                    {
                        ["AppSettings:Secret"] = "test-secret-should-be-long-enough-to-meet-requirements-123456",
                        ["AppSettings:JwtIssuer"] = "MobileCentric",
                        ["AppSettings:JwtAudience"] = "MobileCentricAPI",
                        ["AppSettings:ConnectionString"] = "Server=(local);Database=Test;Trusted_Connection=True;",
                        ["AppSettings:WebAppURL"] = "https://localhost/",
                        ["AppSettings:UploadsFolder"] = "Uploads",
                        ["AppSettings:EmailUserName"] = "test",
                        ["AppSettings:EmailPassword"] = "test",
                        ["AppSettings:EmailHost"] = "smtp.test",
                        ["AppSettings:FromEmailAddress"] = "test@test.local"
                    };
                    conf.AddInMemoryCollection(dict);
                });

                builder.ConfigureTestServices(services =>
                {
                    // no external services required for health check
                });
            });
        }

        [Fact]
        public async Task Get_ReturnsOk()
        {
            var client = _factory.CreateClient();
            var res = await client.GetAsync("/api/health");
            res.EnsureSuccessStatusCode();
            var body = await res.Content.ReadFromJsonAsync<object>();
            Assert.NotNull(body);
        }
    }
}
