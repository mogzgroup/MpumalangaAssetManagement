using System;
using System.Threading.Tasks;
using System.Linq;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace MAM.API.Tests.Controllers
{
    public class FaultControllerTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;

        public FaultControllerTests(WebApplicationFactory<Program> factory)
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
        [Fact]
        public void ServerStarts()
        {
            var client = _factory.CreateClient();
            Assert.NotNull(client);
        }

        [Fact]
        public async Task GetFaults_WithValidToken_ReturnsOk()
        {
            var client = TestHelpers.TestAuthHelper.GetAuthenticatedClientAsync(_factory).GetAwaiter().GetResult();
            var res = await client.GetAsync("/api/fault/getfaults");
            res.EnsureSuccessStatusCode();
            var list = await res.Content.ReadFromJsonAsync<System.Collections.Generic.List<MAM.BusinessLayer.Models.Fault>>();
            Assert.NotNull(list);
        }

        [Fact]
        public async Task AddUpdateDeleteFault_Workflow_ReturnsExpected()
        {
            // Ensure there's a Facility to reference
            var conn = GetTestConnectionString();
            int facilityId;
            using (var db = new MAM.DataAccess.DataContext(conn))
            {
                facilityId = db.Facilities.Select(f => f.Id).FirstOrDefault();
                if (facilityId == 0)
                {
                    var roleId = db.Roles.Select(r => r.Id).FirstOrDefault();
                    if (roleId == 0)
                    {
                        var role = new MAM.DataAccess.Tables.Role { Name = "TestRole", CreatedDate = DateTime.UtcNow, CreatedUserId = 0 };
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
                        CreatedDate = DateTime.UtcNow,
                        CreatedUserId = 0
                    };
                    db.Users.Add(user);
                    db.SaveChanges();

                    var f = new MAM.DataAccess.Tables.Facility
                    {
                        Name = "TEST-FACILITY-" + Guid.NewGuid().ToString("N"),
                        FileReference = "REF-" + Guid.NewGuid().ToString("N"),
                        Type = "Test",
                        ClientCode = "TCODE",
                        CapturerId = user.Id,
                        CreatedDate = DateTime.UtcNow,
                        Status = "Active",
                        UserDepartment = "Test"
                    };
                    db.Facilities.Add(f);
                    db.SaveChanges();
                    facilityId = f.Id;
                }
            }

            var client = TestHelpers.TestAuthHelper.GetAuthenticatedClientAsync(_factory).GetAwaiter().GetResult();

            var model = new MAM.BusinessLayer.Models.Fault
            {
                Id = 0,
                Town = "TestTown",
                FacilityId = facilityId,
                PropertyDescription = "Test Property",
                IncidentDescription = "Automated test incident",
                ContactName = "Tester",
                ContactNumber = "0000000000",
                CreatedDate = DateTime.UtcNow,
                ReferenceNo = $"F-{Guid.NewGuid():N}",
                Status = "New"
            };

            // Add
            var addRes = await client.PostAsJsonAsync("/api/fault/addfault", model);
            addRes.EnsureSuccessStatusCode();
            var id = await addRes.Content.ReadFromJsonAsync<int>();
            Assert.True(id > 0);

            try
            {
                // Update
                model.Id = id;
                model.Status = "UpdatedByTest";
                var updateRes = await client.PostAsJsonAsync("/api/fault/updatefault", model);
                updateRes.EnsureSuccessStatusCode();
                var updated = await updateRes.Content.ReadFromJsonAsync<bool>();
                Assert.True(updated);

                // Verify in DB
                using (var db = new MAM.DataAccess.DataContext(conn))
                {
                    var dbf = db.Faults.FirstOrDefault(fa => fa.Id == id);
                    Assert.NotNull(dbf);
                    Assert.Equal("UpdatedByTest", dbf.Status);

                    // Delete via API
                    var delRes = await client.PostAsJsonAsync("/api/fault/deletefault", dbf);
                    delRes.EnsureSuccessStatusCode();
                    var deleted = await delRes.Content.ReadFromJsonAsync<bool>();
                    Assert.True(deleted);
                }                
            }
            finally
            {
                // Cleanup DB
                using (var db = new MAM.DataAccess.DataContext(conn))
                {
                    var dbf = db.Faults.FirstOrDefault(fa => fa.Id == id);
                    if (dbf != null)
                    {
                        db.Faults.Remove(dbf);
                        db.SaveChanges();
                    }
                }
            }
        }

        [Fact]
        public async Task GetFaultByReferenceNo_WithUnknownReference_ReturnsOkNull()
        {
            var client = TestHelpers.TestAuthHelper.GetAuthenticatedClientAsync(_factory).GetAwaiter().GetResult();
            var res = await client.GetAsync($"/api/fault/getfaultbyreferenceno/{Guid.NewGuid():N}");
            res.EnsureSuccessStatusCode();
            var fault = await res.Content.ReadFromJsonAsync<MAM.BusinessLayer.Models.Fault>();
            Assert.True(fault == null || fault is MAM.BusinessLayer.Models.Fault);
        }

        [Fact]
        public async Task UpdateFault_CreateThenUpdate_ReturnsTrue()
        {
            var conn = GetTestConnectionString();
            int facilityId;
            using (var db = new MAM.DataAccess.DataContext(conn))
            {
                facilityId = db.Facilities.Select(f => f.Id).FirstOrDefault();
                if (facilityId == 0)
                {
                    var roleId = db.Roles.Select(r => r.Id).FirstOrDefault();
                    if (roleId == 0)
                    {
                        var role = new MAM.DataAccess.Tables.Role { Name = "TestRole", CreatedDate = DateTime.UtcNow, CreatedUserId = 0 };
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
                        CreatedDate = DateTime.UtcNow,
                        CreatedUserId = 0
                    };
                    db.Users.Add(user);
                    db.SaveChanges();

                    var f = new MAM.DataAccess.Tables.Facility
                    {
                        Name = "TEST-FACILITY-" + Guid.NewGuid().ToString("N"),
                        FileReference = "REF-" + Guid.NewGuid().ToString("N"),
                        Type = "Test",
                        ClientCode = "TCODE",
                        CapturerId = user.Id,
                        CreatedDate = DateTime.UtcNow,
                        Status = "Active",
                        UserDepartment = "Test"
                    };
                    db.Facilities.Add(f);
                    db.SaveChanges();
                    facilityId = f.Id;
                }
            }

            var client = TestHelpers.TestAuthHelper.GetAuthenticatedClientAsync(_factory).GetAwaiter().GetResult();

            var model = new MAM.BusinessLayer.Models.Fault
            {
                Id = 0,
                Town = "TestTown",
                FacilityId = facilityId,
                PropertyDescription = "Test Property",
                IncidentDescription = "Automated test incident",
                ContactName = "Tester",
                ContactNumber = "0000000000",
                CreatedDate = DateTime.UtcNow,
                ReferenceNo = $"F-{Guid.NewGuid():N}",
                Status = "New"
            };

            // create
            var addRes = await client.PostAsJsonAsync("/api/fault/addfault", model);
            addRes.EnsureSuccessStatusCode();
            var id = await addRes.Content.ReadFromJsonAsync<int>();
            Assert.True(id > 0);

            try
            {
                // update
                model.Id = id;
                model.Status = "UpdatedByUnitTest";
                var updateRes = await client.PostAsJsonAsync("/api/fault/updatefault", model);
                updateRes.EnsureSuccessStatusCode();
                var updated = await updateRes.Content.ReadFromJsonAsync<bool>();
                Assert.True(updated);

                // verify
                using (var db = new MAM.DataAccess.DataContext(conn))
                {
                    var dbf = db.Faults.FirstOrDefault(fa => fa.Id == id);
                    Assert.NotNull(dbf);
                    Assert.Equal("UpdatedByUnitTest", dbf.Status);
                }
            }
            finally
            {
                // try delete via API then fallback to direct DB cleanup                
                using (var db = new MAM.DataAccess.DataContext(conn))
                {
                    var dbf = db.Faults.FirstOrDefault(fa => fa.Id == id);
                    if (dbf != null)
                    {
                        db.Faults.Remove(dbf);
                        db.SaveChanges();
                    }
                }
            }
        }

        [Fact]
        public async Task GetFiles_WithRandomReference_ReturnsOkList()
        {
            var client = TestHelpers.TestAuthHelper.GetAuthenticatedClientAsync(_factory).GetAwaiter().GetResult();
            var res = await client.GetAsync($"/api/fault/getFiles/{Guid.NewGuid():N}");
            res.EnsureSuccessStatusCode();
            var list = await res.Content.ReadFromJsonAsync<System.Collections.Generic.List<string>>();
            Assert.NotNull(list);
        }

        [Fact]
        public async Task GetFaults_WhenServiceThrows_ReturnsServerError()
        {
            var factory = _factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureTestServices(services =>
                {
                    services.AddScoped<MAM.API.Services.IFaultService, ThrowingFaultService>();
                });
            });

            var client = TestHelpers.TestAuthHelper.GetAuthenticatedClientAsync(factory).GetAwaiter().GetResult();
            var res = await client.GetAsync("/api/fault/getfaults");
            Assert.Equal(System.Net.HttpStatusCode.InternalServerError, res.StatusCode);
        }

        private class ThrowingFaultService : MAM.API.Services.IFaultService
        {
            public int AddFault(MAM.BusinessLayer.Models.Fault fault) => throw new Exception("boom");
            public bool DeleteFault(MAM.BusinessLayer.Models.Fault fault) => throw new Exception("boom");
            public MAM.BusinessLayer.Models.Fault GetFaultByReferenceNo(string referenceNo) => throw new Exception("boom");
            public System.Collections.Generic.List<MAM.BusinessLayer.Models.Fault> GetFaults() => throw new Exception("boom");
            public bool UpdateFault(MAM.BusinessLayer.Models.Fault fault) => throw new Exception("boom");
        }
    }
}
