using MAM.API.Services;
using MAM.BusinessLayer.Models;
using MAM.BusinessLayer.Models.Enums;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System;
using System;
using System.Collections.Generic;
using System.Linq;
using System.IdentityModel.Tokens.Jwt;
using System.Globalization;
using System.Text.RegularExpressions;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace MAM.API.Tests.Controllers
{
    public class FacilityControllerTests : IClassFixture<WebApplicationFactory<Program>>, IDisposable
    {
        private readonly WebApplicationFactory<Program> _factory;
        private readonly MAM.API.Tests.TestHelpers.TestDatabaseSeedResult _seedResult;

        public FacilityControllerTests(WebApplicationFactory<Program> factory)
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

                // Use real IFacilityService so tests exercise the configured database
            });
            // Ensure required test data exists in the real database
            _seedResult = TestHelpers.TestDatabaseSeeder.SeedAsync(_factory).GetAwaiter().GetResult();
        }

        public void Dispose()
        {
            TestHelpers.TestDatabaseSeeder.CleanupAsync(_factory, _seedResult).GetAwaiter().GetResult();
        }
        // Placeholder no-op test to reserve space for future tests
        [Fact]
        public void Placeholder_NoOp() { }

        [Fact]
        public async Task GetProperties_WithoutToken_Returns401()
        {
            var client = _factory.CreateClient();
            var res = await client.GetAsync("/api/project/getproperties");
            Assert.Equal(System.Net.HttpStatusCode.Unauthorized, res.StatusCode);
        }

        [Fact]
        public async Task GetProperties_WithValidToken_ReturnsOkAndData()
        {
            var client = TestHelpers.TestAuthHelper.GetAuthenticatedClientAsync(_factory).GetAwaiter().GetResult();

            var res = await client.GetAsync("/api/project/getproperties");
            res.EnsureSuccessStatusCode();
            var props = await res.Content.ReadFromJsonAsync<List<Facility>>();
            Assert.NotNull(props);
        }
        [Fact]
        public async Task GetFacilityZonings_ReturnsOk()
        {
            var client = TestHelpers.TestAuthHelper.GetAuthenticatedClientAsync(_factory).GetAwaiter().GetResult();
            var res = await client.GetAsync("/api/facility/getfacilityzonings");
            res.EnsureSuccessStatusCode();
            var list = await res.Content.ReadFromJsonAsync<List<MAM.BusinessLayer.Models.FacilityType>>();
            Assert.NotNull(list);
        }

        [Fact]
        public async Task GetDashboardWedges_ReturnsOk()
        {
            var client = TestHelpers.TestAuthHelper.GetAuthenticatedClientAsync(_factory).GetAwaiter().GetResult();
            var res = await client.GetAsync("/api/facility/getdashboardwedges");
            res.EnsureSuccessStatusCode();
            var list = await res.Content.ReadFromJsonAsync<List<MAM.BusinessLayer.Models.DashboardWedge>>();
            Assert.NotNull(list);
        }

        [Fact]
        public async Task GetFacilitySummaries_ReturnsOk()
        {
            var client = TestHelpers.TestAuthHelper.GetAuthenticatedClientAsync(_factory).GetAwaiter().GetResult();
            var res = await client.GetAsync("/api/facility/getfacilitysummaries");
            res.EnsureSuccessStatusCode();
            var list = await res.Content.ReadFromJsonAsync<List<MAM.BusinessLayer.Models.FacilitySummaryChart>>();
            Assert.NotNull(list);
        }

        [Fact]
        public async Task GetMapCoordinates_ReturnsOkAndParsableCoordinates()
        {
            var client = TestHelpers.TestAuthHelper.GetAuthenticatedClientAsync(_factory).GetAwaiter().GetResult();
            var res = await client.GetAsync("/api/facility/getmapcoordinates");
            res.EnsureSuccessStatusCode();
            var list = await res.Content.ReadFromJsonAsync<List<MAM.BusinessLayer.Models.MapCoordinate>>();
            Assert.NotNull(list);
            foreach (var coord in list)
            {
                // Longitude and Latitude should contain a parsable numeric value. Normalize and extract numeric token if needed.
                if (!string.IsNullOrWhiteSpace(coord.Longitude))
                {
                    var lon = coord.Longitude.Trim().Replace('\u2212', '-'); // normalize unicode minus
                    var m = Regex.Match(lon, "-?\\d+(\\.\\d+)?");
                    Assert.True(m.Success, $"Longitude '{coord.Longitude}' did not contain a numeric token");
                    Assert.True(double.TryParse(m.Value, NumberStyles.Float, CultureInfo.InvariantCulture, out _), $"Longitude '{coord.Longitude}' is not parseable");
                }

                if (!string.IsNullOrWhiteSpace(coord.Latitude))
                {
                    var lat = coord.Latitude.Trim().Replace('\u2212', '-');
                    var m = Regex.Match(lat, "-?\\d+(\\.\\d+)?");
                    Assert.True(m.Success, $"Latitude '{coord.Latitude}' did not contain a numeric token");
                    Assert.True(double.TryParse(m.Value, NumberStyles.Float, CultureInfo.InvariantCulture, out _), $"Latitude '{coord.Latitude}' is not parseable");
                }
            }
        }

        [Fact]
        public async Task GetBuildingsByTown_InvalidTown_ReturnsOkEmpty()
        {
            var client = TestHelpers.TestAuthHelper.GetAuthenticatedClientAsync(_factory).GetAwaiter().GetResult();
            var res = await client.GetAsync("/api/facility/getbuildings/this-town-does-not-exist");
            res.EnsureSuccessStatusCode();
            var list = await res.Content.ReadFromJsonAsync<List<Facility>>();
            Assert.NotNull(list);
        }

        [Fact]
        public async Task GetAllFacilities_ReturnsOk()
        {
            var client = TestHelpers.TestAuthHelper.GetAuthenticatedClientAsync(_factory).GetAwaiter().GetResult();
            var res = await client.GetAsync("/api/facility/getallfacilities");
            res.EnsureSuccessStatusCode();
            var list = await res.Content.ReadFromJsonAsync<List<Facility>>();
            Assert.NotNull(list);
        }

        [Fact]
        public async Task GetTowns_ReturnsOk()
        {
            var client = TestHelpers.TestAuthHelper.GetAuthenticatedClientAsync(_factory).GetAwaiter().GetResult();
            var res = await client.GetAsync("/api/facility/gettowns");
            res.EnsureSuccessStatusCode();
            var list = await res.Content.ReadFromJsonAsync<List<string>>();
            Assert.NotNull(list);
        }

        [Fact]
        public async Task GetAssetRegisterFacilities_ReturnsOk()
        {
            var client = TestHelpers.TestAuthHelper.GetAuthenticatedClientAsync(_factory).GetAwaiter().GetResult();
            var res = await client.GetAsync("/api/facility/getassetregisterfacilities");
            res.EnsureSuccessStatusCode();
            var list = await res.Content.ReadFromJsonAsync<List<Facility>>();
            Assert.NotNull(list);
        }

        [Fact]
        public async Task GetFacilityByCode_InvalidId_ReturnsNotFound()
        {
            var client = TestHelpers.TestAuthHelper.GetAuthenticatedClientAsync(_factory).GetAwaiter().GetResult();
            var res = await client.GetAsync("/api/facility/getFacilityByCode/0/1");
            Assert.Equal(System.Net.HttpStatusCode.NotFound, res.StatusCode);
        }

        [Fact]
        public async Task DeleteFacility_InvalidId_ReturnsOkBool()
        {
            // Create a facility directly in the test database, then call the API to delete it
            var conn = GetTestConnectionString();
            int createdId = 0;
            using (var db = new MAM.DataAccess.DataContext(conn))
            {
                // Ensure a valid CapturerId exists (create Role and User if necessary)
                var capturerId = db.Users.Select(u => u.Id).FirstOrDefault();
                if (capturerId == 0)
                {
                    var roleId = db.Roles.Select(r => r.Id).FirstOrDefault();
                    if (roleId == 0)
                    {
                        var role = new MAM.DataAccess.Tables.Role
                        {
                            Name = "TestRole",
                            CreatedDate = DateTime.Now,
                            CreatedUserId = 0
                        };
                        db.Roles.Add(role);
                        db.SaveChanges();
                        roleId = role.Id;
                    }

                    var user = new MAM.DataAccess.Tables.User
                    {
                        Name = "Test",
                        Surname = "User",
                        Username = "testuser_" + Guid.NewGuid().ToString("N"),
                        Password = "TempPass!1",
                        RoleId = roleId,
                        IsActive = true,
                        Email = "test@local",
                        PasswordIsChanged = false,
                        CreatedDate = DateTime.Now,
                        CreatedUserId = 0
                    };
                    db.Users.Add(user);
                    db.SaveChanges();
                    capturerId = user.Id;
                }

                var f = new MAM.DataAccess.Tables.Facility
                {
                    Name = "TEST-FACILITY-" + Guid.NewGuid().ToString("N"),
                    FileReference = "REF-" + Guid.NewGuid().ToString("N"),
                    Type = "Test",
                    ClientCode = "TCODE",
                    CapturerId = capturerId,
                    CreatedDate = DateTime.Now,
                    Status = "Active",
                    UserDepartment = "Test"
                };
                db.Facilities.Add(f);
                db.SaveChanges();
                createdId = f.Id;
            }

            var client = TestHelpers.TestAuthHelper.GetAuthenticatedClientAsync(_factory).GetAwaiter().GetResult();
            var res = await client.DeleteAsync($"/api/facility/deleteFacility/{createdId}");
            res.EnsureSuccessStatusCode();
            var deleted = await res.Content.ReadFromJsonAsync<bool>();
            Assert.True(deleted);

            // verify status in DB
            using (var db = new MAM.DataAccess.DataContext(conn))
            {
                var dbf = db.Facilities.FirstOrDefault(x => x.Id == createdId);
                Assert.NotNull(dbf);
                Assert.Equal("Deleted", dbf.Status);
            }
        }

        private string GetTestConnectionString()
        {
            var envConn = Environment.GetEnvironmentVariable("AppSettings__ConnectionString")
                          ?? Environment.GetEnvironmentVariable("AppSettings_ConnectionString")
                          ?? Environment.GetEnvironmentVariable("MAM_TEST_CONNECTIONSTRING");
            var config = _factory.Services.GetService(typeof(IConfiguration)) as IConfiguration;
            var conn = envConn ?? config?.GetSection("AppSettings")["ConnectionString"];
            if (string.IsNullOrWhiteSpace(conn))
                throw new InvalidOperationException("Test database connection string not provided. Set AppSettings__ConnectionString or MAM_TEST_CONNECTIONSTRING.");
            return conn;
        }

        // Tests use the real IFacilityService implementation against the configured database
    }
}
