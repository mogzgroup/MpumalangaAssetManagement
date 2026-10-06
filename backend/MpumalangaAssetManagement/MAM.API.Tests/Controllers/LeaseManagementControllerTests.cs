using System;
using System.Threading.Tasks;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace MAM.API.Tests.Controllers
{
    public class LeaseManagementControllerTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;

        public LeaseManagementControllerTests(WebApplicationFactory<Program> factory)
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
        public async Task GetLeasedProperties_WithValidToken_ReturnsOk()
        {
            var client = TestHelpers.TestAuthHelper.GetAuthenticatedClientAsync(_factory).GetAwaiter().GetResult();
            var res = await client.GetAsync("/api/leasemanagement/getleasedproperties");
            res.EnsureSuccessStatusCode();
            var list = await res.Content.ReadFromJsonAsync<System.Collections.Generic.List<MAM.BusinessLayer.Models.LeasedProperty>>();
            Assert.NotNull(list);
        }

        [Fact]
        public async Task GetLeasedPropertyDetails_WithInvalidModel_ReturnsOk()
        {
            // Use TestLeaseService so we can create an in-memory leased property then retrieve its details
            var factory = _factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureTestServices(services =>
                {
                    services.AddSingleton<MAM.API.Services.ILeaseManagementService, TestLeaseService>();
                });
            });

            var svc = factory.Services.GetService(typeof(MAM.API.Services.ILeaseManagementService)) as TestLeaseService;
            var created = new MAM.BusinessLayer.Models.LeasedProperty
            {
                PropertyCode = "TEST-LEASE-" + Guid.NewGuid().ToString("N"),
                FileReference = "REF",
                District = "D",
                Type = "T",
                FacilityName = "F",
                LandId = 1
            };
            svc.AddLocal(created);

            var client = TestHelpers.TestAuthHelper.GetAuthenticatedClientAsync(factory).GetAwaiter().GetResult();
            var res = await client.PostAsJsonAsync("/api/leasemanagement/getleasedpropertydetails", created);
            res.EnsureSuccessStatusCode();
            var details = await res.Content.ReadFromJsonAsync<MAM.BusinessLayer.Models.LeasedProperty>();
            Assert.NotNull(details);
            Assert.Equal(created.PropertyCode, details.PropertyCode);
        }

        [Fact]
        public async Task DeleteLeasedProperty_WithInvalidModel_ReturnsOkBool()
        {
            // Use a test service to create an in-memory leased property then delete it via the controller
            var factory = _factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureTestServices(services =>
                {
                    services.AddSingleton<MAM.API.Services.ILeaseManagementService, TestLeaseService>();
                });
            });

            // get the test service instance and add a new leased property to delete
            var svc = factory.Services.GetService(typeof(MAM.API.Services.ILeaseManagementService)) as TestLeaseService;
            var created = new MAM.BusinessLayer.Models.LeasedProperty
            {
                PropertyCode = "TEST-LEASE-" + Guid.NewGuid().ToString("N"),
                FileReference = "REF",
                District = "D",
                Type = "T",
                FacilityName = "F",
                LandId = 1
            };
            svc.AddLocal(created);

            var client = TestHelpers.TestAuthHelper.GetAuthenticatedClientAsync(factory).GetAwaiter().GetResult();
            var res = await client.PostAsJsonAsync("/api/leasemanagement/deleteLeasedProperty", created);
            res.EnsureSuccessStatusCode();
            var deleted = await res.Content.ReadFromJsonAsync<bool>();
            Assert.True(deleted);
        }

        [Fact]
        public async Task GetLeasedProperties_WhenServiceThrows_ReturnsServerError()
        {
            var factory = _factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureTestServices(services =>
                {
                    services.AddScoped<MAM.API.Services.ILeaseManagementService, ThrowingLeaseService>();
                });
            });

            var client = TestHelpers.TestAuthHelper.GetAuthenticatedClientAsync(factory).GetAwaiter().GetResult();
            var res = await client.GetAsync("/api/leasemanagement/getleasedproperties");
            Assert.Equal(System.Net.HttpStatusCode.InternalServerError, res.StatusCode);
        }

        private class ThrowingLeaseService : MAM.API.Services.ILeaseManagementService
        {
            public int AddLeasedProperty(MAM.BusinessLayer.Models.LeasedProperty lp) => throw new Exception("boom");
            public bool DeleteLeasedProperty(MAM.BusinessLayer.Models.LeasedProperty lp) => throw new Exception("boom");
            public System.Collections.Generic.List<MAM.BusinessLayer.Models.LeasedProperty> GetLeasedProperties() => throw new Exception("boom");
            public MAM.BusinessLayer.Models.LeasedProperty GetLeasedPropertyDetails(MAM.BusinessLayer.Models.LeasedProperty lp) => throw new Exception("boom");
        }

        private class TestLeaseService : MAM.API.Services.ILeaseManagementService
        {
            private readonly System.Collections.Generic.List<MAM.BusinessLayer.Models.LeasedProperty> _local = new System.Collections.Generic.List<MAM.BusinessLayer.Models.LeasedProperty>();
            public int AddLeasedProperty(MAM.BusinessLayer.Models.LeasedProperty lp)
            {
                lp.PropertyCode = lp.PropertyCode ?? "P-" + Guid.NewGuid().ToString("N");
                _local.Add(lp);
                return _local.Count; // return non-zero id
            }
            public bool DeleteLeasedProperty(MAM.BusinessLayer.Models.LeasedProperty lp)
            {
                var existing = _local.Find(x => x.PropertyCode == lp.PropertyCode);
                if (existing != null)
                {
                    _local.Remove(existing);
                    return true;
                }
                return false;
            }
            public System.Collections.Generic.List<MAM.BusinessLayer.Models.LeasedProperty> GetLeasedProperties() => _local;
            public MAM.BusinessLayer.Models.LeasedProperty GetLeasedPropertyDetails(MAM.BusinessLayer.Models.LeasedProperty lp) => _local.Find(x => x.PropertyCode == lp.PropertyCode);

            // Helper for tests to pre-add
            public void AddLocal(MAM.BusinessLayer.Models.LeasedProperty p) => _local.Add(p);
        }
    }
}
