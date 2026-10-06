using System;
// Ensure System namespace is imported for Environment usage (no-op if already present)
using System.Collections.Generic;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using Xunit;
using MAM.BusinessLayer.Models;
using MAM.API.Services;

namespace MAM.API.Tests.Controllers
{
    public class ProjectControllerTests : IClassFixture<WebApplicationFactory<Program>>, IDisposable
    {
        private readonly WebApplicationFactory<Program> _factory;
        private readonly MAM.API.Tests.TestHelpers.TestDatabaseSeedResult _seedResult;

        public ProjectControllerTests(WebApplicationFactory<Program> factory)
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

                // Use real services so tests exercise the configured database
            });
            // Ensure required test data exists in the real database
            _seedResult = TestHelpers.TestDatabaseSeeder.SeedAsync(_factory).GetAwaiter().GetResult();
        }

        public void Dispose()
        {
            // clean up seeded data
            TestHelpers.TestDatabaseSeeder.CleanupAsync(_factory, _seedResult).GetAwaiter().GetResult();
        }

        [Fact]
        public async Task GetProjects_WithoutToken_Returns401()
        {
            var client = _factory.CreateClient();
            var res = await client.GetAsync("/api/project/getprojects");
            Assert.Equal(System.Net.HttpStatusCode.Unauthorized, res.StatusCode);
        }

        [Fact]
        public async Task GetProjects_WithValidToken_ReturnsOkAndData()
        {
            var client = TestHelpers.TestAuthHelper.GetAuthenticatedClientAsync(_factory).GetAwaiter().GetResult();

            var res = await client.GetAsync("/api/project/getprojects");
            res.EnsureSuccessStatusCode();
            var projects = await res.Content.ReadFromJsonAsync<List<Project>>();
            Assert.NotNull(projects);
            Assert.Single(projects);
            Assert.Equal("Test Project", projects[0].Name);
        }

        [Fact]
        public async Task GetProperties_ReturnsOk()
        {
            var client = TestHelpers.TestAuthHelper.GetAuthenticatedClientAsync(_factory).GetAwaiter().GetResult();
            var res = await client.GetAsync("/api/project/getproperties");
            res.EnsureSuccessStatusCode();
            var list = await res.Content.ReadFromJsonAsync<List<Facility>>();
            Assert.NotNull(list);
            // allow empty list; ensure endpoint responds successfully
        }

        [Fact]
        public async Task AddProject_ReturnsId_AndCleanup()
        {
            var client = TestHelpers.TestAuthHelper.GetAuthenticatedClientAsync(_factory).GetAwaiter().GetResult();

            var project = new Project
            {
                Id = 0,
                OrderNumber = $"TEST-{Guid.NewGuid():N}",
                Name = "Temp Test Project",
                StartDate = DateTime.UtcNow,
                PracticalCompletionDate = DateTime.UtcNow.AddDays(30),
                PlannedDuration = "30 Days",
                ScopeofWork = "Automated test project",
                HasFinancials = false,
                HasParentProject = false,
                Amount = 123.45,
                ManagedBy = "TEST",
                EmployeeName = "Tester",
                ContactName = "Tester",
                ContactNumber = "0000000000",
                BusinessName = "Test Business",
                BusinessRegNumber = "REG-TEST",
                CreatedDate = DateTime.UtcNow,
                IsDeleted = false,
                Status = "Active"
            };

            var res = await client.PostAsJsonAsync("/api/project/addproject", project);
            res.EnsureSuccessStatusCode();
            var id = await res.Content.ReadFromJsonAsync<int>();
            Assert.True(id > 0);

            // cleanup
            try
            {
                project.Id = id;
                // ensure non-null ProjectSuppliers when deleting to satisfy repository expectations
                project.ProjectSuppliers ??= new System.Collections.Generic.List<ProjectSupplier>();
                var del = await client.PostAsJsonAsync("/api/project/deleteproject", project);
                if (!del.IsSuccessStatusCode)
                {
                    var body = await del.Content.ReadAsStringAsync();
                    throw new InvalidOperationException($"DeleteProject failed: {(int)del.StatusCode} {del.ReasonPhrase} - {body}");
                }
            }
            catch { }
        }

        [Fact]
        public async Task UpdateProject_ReturnsUpdatedProject()
        {
            var client = TestHelpers.TestAuthHelper.GetAuthenticatedClientAsync(_factory).GetAwaiter().GetResult();

            // create
            var project = new Project
            {
                Id = 0,
                OrderNumber = $"TEST-{Guid.NewGuid():N}",
                Name = "Temp To Update",
                StartDate = DateTime.UtcNow,
                PracticalCompletionDate = DateTime.UtcNow.AddDays(30),
                PlannedDuration = "30 Days",
                ScopeofWork = "Automated update test",
                HasFinancials = false,
                HasParentProject = false,
                Amount = 0,
                ManagedBy = "TEST",
                EmployeeName = "Tester",
                ContactName = "Tester",
                ContactNumber = "0000000000",
                BusinessName = "Test Business",
                BusinessRegNumber = "REG-TEST",
                CreatedDate = DateTime.UtcNow,
                IsDeleted = false,
                Status = "Active",
                ProjectSuppliers = new System.Collections.Generic.List<ProjectSupplier>()
            };
            var add = await client.PostAsJsonAsync("/api/project/addproject", project);
            add.EnsureSuccessStatusCode();
            var id = await add.Content.ReadFromJsonAsync<int>();
            Assert.True(id > 0);

            // update
            project.Id = id;
            project.Name = "Updated Name";
            project.OrderNumber = project.OrderNumber + "-U";
            // ensure ProjectSuppliers is not null to avoid repository null-foreach
            project.ProjectSuppliers ??= new System.Collections.Generic.List<ProjectSupplier>();

            var upd = await client.PostAsJsonAsync("/api/project/updateproject", project);
            upd.EnsureSuccessStatusCode();
            var updated = await upd.Content.ReadFromJsonAsync<Project>();
            Assert.NotNull(updated);
            Assert.Equal(id, updated!.Id);
            Assert.Equal("Updated Name", updated.Name);

            // cleanup
            try { await client.PostAsJsonAsync("/api/project/deleteproject", project); } catch { }
        }

        [Fact]
        public async Task DeleteProject_ReturnsOk()
        {
            var client = TestHelpers.TestAuthHelper.GetAuthenticatedClientAsync(_factory).GetAwaiter().GetResult();

            var project = new Project
            {
                Id = 0,
                OrderNumber = $"DEL-{Guid.NewGuid():N}",
                Name = "Temp To Delete",
                StartDate = DateTime.Now,
                CreatedDate = DateTime.Now
            };
            var add = await client.PostAsJsonAsync("/api/project/addproject", project);
            add.EnsureSuccessStatusCode();
            var id = await add.Content.ReadFromJsonAsync<int>();

            project.Id = id;
            var res = await client.PostAsJsonAsync("/api/project/deleteproject", project);
            res.EnsureSuccessStatusCode();
            var result = await res.Content.ReadFromJsonAsync<bool>();
            Assert.True(result);
        }

        // Tests use real IProjectService and IFacilityService implementations against the configured database
            public List<string> GetTowns() => new List<string>();
            public List<Facility> GetBuildingsByTown(string town) => new List<Facility>();
        }
    }

