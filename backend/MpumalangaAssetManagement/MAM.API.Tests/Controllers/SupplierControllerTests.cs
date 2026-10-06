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
    public class SupplierControllerTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;
        public SupplierControllerTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory.WithWebHostBuilder(builder =>
            {
                builder.UseEnvironment("Test");
                // Load user secrets and fall back to safe defaults; avoid hardcoded credentials
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
                // Use the real ISupplierService backed by the configured database
            });

            // Do not seed database at class construction time to avoid early DB connections.
            // Individual tests will seed/cleanup as needed to reduce shared connection pressure.
        }

        [Fact]
        public async Task GetSuppliers_ReturnsOk()
        {
            var client = GetAuthenticatedClient();
            var res = await client.GetAsync("/api/supplier/getsuppliers");
            res.EnsureSuccessStatusCode();
            var list = await res.Content.ReadFromJsonAsync<List<Supplier>>();
            Assert.NotNull(list);
            Assert.NotEmpty(list);
            // If the seeder added a Test Supplier, assert at least one supplier exists
        }

        [Fact]
        public async Task AddSuppliers_ReturnsOkList()
        {
            var client = GetAuthenticatedClient();
            var suppliers = new List<Supplier> { new Supplier { Id = 0, CompanyName = "Test", CreatedDate = DateTime.UtcNow } };
            var res = await client.PostAsJsonAsync("/api/supplier/addsuppliers", suppliers);
            res.EnsureSuccessStatusCode();
            var returned = await res.Content.ReadFromJsonAsync<List<Supplier>>();
            Assert.NotNull(returned);
            Assert.Single(returned);
            Assert.Equal("Test", returned[0].CompanyName);

            // cleanup inserted supplier(s) if the API returned ids
            try
            {
                foreach (var s in returned)
                {
                    if (s.Id != 0)
                    {
                        await client.PostAsJsonAsync("/api/supplier/deletesupplier", new Supplier { Id = s.Id });
                    }
                }
            }
            catch { }
        }

        private System.Net.Http.HttpClient GetAuthenticatedClient()
        {
            return TestHelpers.TestAuthHelper.GetAuthenticatedClientAsync(_factory).GetAwaiter().GetResult();
        }

        // Tests use real ISupplierService against the configured database

        // Lightweight test double used by these integration tests
        private class TestSupplierService : MAM.API.Services.ISupplierService
        {
            public int AddSupplier(MAM.BusinessLayer.Models.Supplier supplier) => 1;
            public System.Collections.Generic.List<MAM.BusinessLayer.Models.Supplier> AddSuppliers(System.Collections.Generic.List<MAM.BusinessLayer.Models.Supplier> suppliers)
            {
                // Simulate assigning an Id and returning the list
                suppliers[0].Id = 1;
                return suppliers;
            }
            public bool DeleteSupplier(MAM.BusinessLayer.Models.Supplier supplier) => true;
            public MAM.BusinessLayer.Models.Supplier UpdateSupplier(MAM.BusinessLayer.Models.Supplier supplier)
            {
                supplier.CompanyName = supplier.CompanyName ?? "";
                supplier.Id = supplier.Id == 0 ? 1 : supplier.Id;
                return supplier;
            }
            public System.Collections.Generic.List<MAM.BusinessLayer.Models.Supplier> GetSuppliers() => new System.Collections.Generic.List<MAM.BusinessLayer.Models.Supplier>
            {
                new MAM.BusinessLayer.Models.Supplier { Id = 1, CompanyName = "Test" }
            };
        }
    }
}
