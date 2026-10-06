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
                    builder.ConfigureAppConfiguration((context, conf) =>
                    {
                        MAM.API.Tests.TestHelpers.TestConfiguration.AddUserSecretsToConfig(conf);
                        var fallback = new System.Collections.Generic.Dictionary<string, string?>
                        {
                            ["AppSettings_Secret"] = "test-secret-should-be-long-enough-to-meet-requirements-123456",
                            ["AppSettings_JwtIssuer"] = "MobileCentric",
                            ["AppSettings_JwtAudience"] = "MobileCentricAPI",
                        };
                        foreach (var kv in fallback)
                        {
                            if (System.Environment.GetEnvironmentVariable(kv.Key) is null)
                            {
                                System.Environment.SetEnvironmentVariable(kv.Key, kv.Value);
                            }
                        }
                    });

                // Use real services; no test service overrides
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
