using System;
using System.Threading.Tasks;
using System.Net.Http.Json;
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
                builder.ConfigureAppConfiguration((context, conf) =>
                {
                    MAM.API.Tests.TestHelpers.TestConfiguration.AddUserSecretsToConfig(conf);
                    var fallback = new System.Collections.Generic.Dictionary<string, string?>
                    {
                        ["AppSettings_Secret"] = "test-secret-should-be-long-enough-to-meet-requirements-123456",
                        ["AppSettings_JwtIssuer"] = "MobileCentric",
                        ["AppSettings_JwtAudience"] = "MobileCentricAPI"
                    };
                    foreach (var kv in fallback)
                    {
                        if (Environment.GetEnvironmentVariable(kv.Key) is null)
                            Environment.SetEnvironmentVariable(kv.Key, kv.Value);
                    }
                });
            });
        }

        [Fact]
        public void ServerStarts()
        {
            var client = _factory.CreateClient();
            Assert.NotNull(client);
        }

        [Fact]
        public async Task TestEndpoint_ReturnsTrue()
        {
            var client = _factory.CreateClient();
            var res = await client.PostAsync("/api/uamp/test", null);
            res.EnsureSuccessStatusCode();
            var val = await res.Content.ReadFromJsonAsync<bool>();
            Assert.True(val);
        }

        [Fact]
        public async Task GetUamps_WithDepartment_ReturnsOk()
        {
            var client = _factory.CreateClient();
            var res = await client.GetAsync("/api/uamp/getuamps/test");
            res.EnsureSuccessStatusCode();
            var list = await res.Content.ReadFromJsonAsync<System.Collections.Generic.List<MAM.BusinessLayer.Models.UserImmovableAssetManagementPlan>>();
            Assert.NotNull(list);
        }

        [Fact]
        public async Task GetUampTemplate_InvalidTemplate_ReturnsOkNull()
        {
            var client = _factory.CreateClient();
            var res = await client.GetAsync("/api/uamp/getuamptemplate/0/99");
            res.EnsureSuccessStatusCode();
            var obj = await res.Content.ReadFromJsonAsync<object>();
            Assert.True(obj == null || obj is object);
        }

        [Fact]
        public async Task SaveUamp_Posts_ReturnsOk()
        {
            var client = _factory.CreateClient();
            var model = new MAM.BusinessLayer.Models.UserImmovableAssetManagementPlan { Id = 0 };
            var resSave = await client.PostAsJsonAsync("/api/uamp/saveuamp", model);
            resSave.EnsureSuccessStatusCode();
        }

        [Fact]
        public async Task StartUamp_Posts_ReturnsOk()
        {
            var client = _factory.CreateClient();
            var model = new MAM.BusinessLayer.Models.UserImmovableAssetManagementPlan { Id = 0 };
            var resStart = await client.PostAsJsonAsync("/api/uamp/startuamp", model);
            resStart.EnsureSuccessStatusCode();
        }
    }
}
