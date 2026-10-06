using System;
using System.Collections.Generic;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Xunit;
using MAM.API.Services;
using MAM.BusinessLayer.Models;

namespace MAM.API.Tests.Controllers
{
    public class HiringRegisterControllerTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;

        public HiringRegisterControllerTests(WebApplicationFactory<Program> factory)
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
                    // Do not replace IHiringRegisterService with a fake; use real implementation against configured database
            });
        }

        [Fact]
        public async Task GetHiredProperties_ReturnsOk()
        {
            var client = GetAuthenticatedClient();

            // Ensure there is at least one hired property by creating a temp entry
            var newProp = new HiredProperty
            {
                Id = 0,
                PropertyCode = $"HP_{Guid.NewGuid():N}",
                Type = "Test",
                District = "TestDistrict",
                BuildingCondition = "Good",
                Town = "TestTown",
                Status = "Active",
                CreatedUserId = 1,
                CreatedDate = DateTime.Now,
                IsDeteted = false
            };
            var addRes = await client.PostAsJsonAsync("/api/hiringregister/addhiredproperty", newProp);
            addRes.EnsureSuccessStatusCode();
            var addedId = await addRes.Content.ReadFromJsonAsync<int>();

            var res = await client.GetAsync("/api/hiringregister/gethiredproperties");
            res.EnsureSuccessStatusCode();
            var list = await res.Content.ReadFromJsonAsync<List<HiredProperty>>();
            Assert.NotNull(list);
            Assert.NotEmpty(list);

            // cleanup created temp if the API returned an id
            try
            {
                if (addedId > 0)
                {
                    newProp.Id = addedId;
                    await client.PostAsJsonAsync("/api/hiringregister/deletehiredproperty", newProp);
                }
            }
            catch { }
        }

        [Fact]
        public async Task AddUpdateDeleteHiredProperty_ReturnsExpected()
        {
            var client = GetAuthenticatedClient();
            var newProp = new HiredProperty
            {
                Id = 0,
                PropertyCode = $"HP_{Guid.NewGuid():N}",
                Type = "Test",
                District = "TestDistrict",
                BuildingCondition = "Good",
                Town = "TestTown",
                Status = "Active",
                CreatedUserId = 1,
                CreatedDate = DateTime.Now,
                IsDeteted = false
            };
            var addRes = await client.PostAsJsonAsync("/api/hiringregister/addhiredproperty", newProp);
            addRes.EnsureSuccessStatusCode();
            var id = await addRes.Content.ReadFromJsonAsync<int>();
            Assert.True(id > 0);

            // update
            newProp.Id = id;
            // set Modified metadata for update to avoid DB constraints on non-nullable fields
            newProp.ModifiedUserId = 1;
            newProp.ModifiedDate = DateTime.UtcNow;
            newProp.PropertyCode = newProp.PropertyCode + "-U";
            var updateRes = await client.PostAsJsonAsync("/api/hiringregister/updatehiredproperty", newProp);
            updateRes.EnsureSuccessStatusCode();
            var updated = await updateRes.Content.ReadFromJsonAsync<bool>();
            Assert.True(updated);

            // delete
            var deleteRes = await client.PostAsJsonAsync("/api/hiringregister/deletehiredproperty", newProp);
            deleteRes.EnsureSuccessStatusCode();
            var deleted = await deleteRes.Content.ReadFromJsonAsync<bool>();
            Assert.True(deleted);
        }

        private System.Net.Http.HttpClient GetAuthenticatedClient()
        {
            return TestHelpers.TestAuthHelper.GetAuthenticatedClientAsync(_factory).GetAwaiter().GetResult();
        }

        // Tests use real IHiringRegisterService against the configured database

        private class TestHiringRegisterService : MAM.API.Services.IHiringRegisterService
        {
            public int AddHiredProperty(MAM.BusinessLayer.Models.HiredProperty hp) => 1;
            public bool DeleteHiredProperty(MAM.BusinessLayer.Models.HiredProperty hp) => true;
            public System.Collections.Generic.List<MAM.BusinessLayer.Models.HiredProperty> GetHiredProperties() => new System.Collections.Generic.List<MAM.BusinessLayer.Models.HiredProperty>
            {
                new MAM.BusinessLayer.Models.HiredProperty { Id = 1, PropertyCode = "P1" }
            };
            public bool UpdateHiredProperty(MAM.BusinessLayer.Models.HiredProperty hp) => true;
        }
    }
}
