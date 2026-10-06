using System;
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
using System.Collections.Generic;

namespace MAM.API.Tests.Controllers
{
    public class CAMPControllerTests : IClassFixture<WebApplicationFactory<Program>>, IDisposable
    {
        private readonly WebApplicationFactory<Program> _factory;
        private readonly MAM.API.Tests.TestHelpers.TestDatabaseSeedResult _seedResult;

        public CAMPControllerTests(WebApplicationFactory<Program> factory)
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

                // Use real services so tests exercise the database using the provided connection string
            });
            // Ensure required test data exists in the real database
            _seedResult = TestHelpers.TestDatabaseSeeder.SeedAsync(_factory).GetAwaiter().GetResult();
        }

        public void Dispose()
        {
            TestHelpers.TestDatabaseSeeder.CleanupAsync(_factory, _seedResult).GetAwaiter().GetResult();
        }

        [Fact]
        public async Task GetCamps_Anonymous_ReturnsOk()
        {
            var client = _factory.CreateClient();
            var res = await client.GetAsync("/api/camp/getcamps/test");
            res.EnsureSuccessStatusCode();
            var camps = await res.Content.ReadFromJsonAsync<List<Camp>>()!;
            Assert.NotNull(camps);
            Assert.Single(camps);
            Assert.True(camps[0].Id > 0);
        }

        [Fact]
        public async Task GetCamps_NonExistentDepartment_ReturnsEmptyCollection()
        {
            var client = _factory.CreateClient();
            var res = await client.GetAsync("/api/camp/getcamps/department-does-not-exist");
            res.EnsureSuccessStatusCode();
            var camps = await res.Content.ReadFromJsonAsync<List<Camp>>()!;
            Assert.NotNull(camps);
            Assert.Empty(camps);
        }

        [Fact]
        public async Task GetCamps_WhenServiceThrows_ReturnsServerError()
        {
            // Create a factory that replaces ICampService with a throwing implementation
            var factory = _factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureTestServices(services =>
                {
                    services.AddScoped<MAM.API.Services.ICampService, ThrowingCampService>();
                });
            });

            var client = factory.CreateClient();
            var res = await client.GetAsync("/api/camp/getcamps/test");
            Assert.Equal(System.Net.HttpStatusCode.InternalServerError, res.StatusCode);
        }

        private class ThrowingCampService : MAM.API.Services.ICampService
        {
            public int AddCamp(MAM.BusinessLayer.Models.Camp camp) => throw new System.Exception("boom");
            public System.Collections.Generic.List<MAM.BusinessLayer.Models.Camp> GetCamps(string department) => throw new System.Exception("boom");
            public bool UpdateCamp(MAM.BusinessLayer.Models.Camp camp) => throw new System.Exception("boom");
            public bool DeleteCamp(MAM.BusinessLayer.Models.Camp camp) => throw new System.Exception("boom");
        }

        // Tests now use the real ICampService implementation and the configured test database
    }
}
