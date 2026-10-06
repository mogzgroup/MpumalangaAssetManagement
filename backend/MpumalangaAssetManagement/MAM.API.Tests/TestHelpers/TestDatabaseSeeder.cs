using System;
using System.Linq;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using MAM.DataAccess;
using MAM.DataAccess.Tables;

namespace MAM.API.Tests.TestHelpers
{
    public class TestDatabaseSeedResult
    {
        public System.Collections.Generic.List<int> ProjectIds { get; } = new System.Collections.Generic.List<int>();
        public System.Collections.Generic.List<int> SupplierIds { get; } = new System.Collections.Generic.List<int>();
        public System.Collections.Generic.List<int> HiredPropertyIds { get; } = new System.Collections.Generic.List<int>();
        public System.Collections.Generic.List<int> CampIds { get; } = new System.Collections.Generic.List<int>();
    }

    public static class TestDatabaseSeeder
    {
        public static Task<TestDatabaseSeedResult> SeedAsync(WebApplicationFactory<Program> factory)
        {
            // run synchronously to keep test constructors simple
            return Task.FromResult(SeedInternal(factory));
        }

        private static TestDatabaseSeedResult SeedInternal(WebApplicationFactory<Program> factory)
        {
            var result = new TestDatabaseSeedResult();
            // Determine connection string: prefer user secrets first, then environment variables, then host config
            string conn = null;
            try
            {
                var appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
                var secretsRoot = System.IO.Path.Combine(appData, "Microsoft", "UserSecrets");
                if (System.IO.Directory.Exists(secretsRoot))
                {
                    foreach (var dir in System.IO.Directory.EnumerateDirectories(secretsRoot))
                    {
                        var secretsFile = System.IO.Path.Combine(dir, "secrets.json");
                        if (System.IO.File.Exists(secretsFile))
                        {
                            var json = System.IO.File.ReadAllText(secretsFile);
                            using var doc = System.Text.Json.JsonDocument.Parse(json);
                            if (doc.RootElement.TryGetProperty("ConnectionString", out var csEl))
                            {
                                conn = csEl.GetString();
                                break;
                            }
                        }
                    }
                }
            }
            catch { }

            if (string.IsNullOrWhiteSpace(conn))
            {
                // Accept both single-underscore and double-underscore environment variable forms
                var envConn = Environment.GetEnvironmentVariable("AppSettings__ConnectionString")
                              ?? Environment.GetEnvironmentVariable("AppSettings_ConnectionString")
                              ?? Environment.GetEnvironmentVariable("MAM_TEST_CONNECTIONSTRING");
                var config = factory.Services.GetService(typeof(IConfiguration)) as IConfiguration;
                conn = envConn ?? config?.GetSection("AppSettings")["ConnectionString"];
            }
            if (string.IsNullOrWhiteSpace(conn))
            {
                // Try reading connection string from user secrets
                try
                {
                    var appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
                    var secretsRoot = System.IO.Path.Combine(appData, "Microsoft", "UserSecrets");
                    if (System.IO.Directory.Exists(secretsRoot))
                    {
                        foreach (var dir in System.IO.Directory.EnumerateDirectories(secretsRoot))
                        {
                            var secretsFile = System.IO.Path.Combine(dir, "secrets.json");
                            if (System.IO.File.Exists(secretsFile))
                            {
                                var json = System.IO.File.ReadAllText(secretsFile);
                                using var doc = System.Text.Json.JsonDocument.Parse(json);
                                if (doc.RootElement.TryGetProperty("ConnectionString", out var csEl))
                                {
                                    conn = csEl.GetString();
                                    break;
                                }
                            }
                        }
                    }
                }
                catch { }
            }

            if (string.IsNullOrWhiteSpace(conn))
                throw new InvalidOperationException("Test database connection string not provided. Set AppSettings__ConnectionString, MAM_TEST_CONNECTIONSTRING, or add ConnectionString to user secrets.");

            // Authenticate using provided test credentials (env variables) and get an authenticated client (synchronously)
            var client = TestAuthHelper.GetAuthenticatedClientAsync(factory).GetAwaiter().GetResult();

            // Ensure there is at least one project (insert directly and track id)
            using (var db = new DataContext(conn))
            {
                var existingProject = db.Projects.FirstOrDefault(p => p.Name == "Test Project");
                if (existingProject == null)
                {
                    var now = DateTime.UtcNow;
                    var proj = new MAM.DataAccess.Tables.Project
                    {
                        OrderNumber = "TEST-001",
                        District = "Test District",
                        PropertyId = 0,
                        Name = "Test Project",
                        StartDate = now,
                        PracticalCompletionDate = now.AddDays(30),
                        PlannedDuration = "30 Days",
                        ScopeofWork = "Automated integration test project",
                        HasFinancials = false,
                        HasParentProject = false,
                        ParentProjectId = null,
                        Amount = 100000,
                        Account = null,
                        ManagedBy = "TEST",
                        EmployeeName = "Test Employee",
                        EmployeeNumber = null,
                        ContactName = "Test Contact",
                        ContactNumber = "0000000000",
                        BusinessName = "Test Business",
                        BusinessRegNumber = "TEST-REG",
                        CreatedDate = now,
                        ModifiedDate = now,
                        IsDeleted = false,
                        Status = "Active"
                    };

                    db.Projects.Add(proj);
                    db.SaveChanges();
                    result.ProjectIds.Add(proj.Id);
                }
            }

            // Ensure there is at least one supplier (insert directly and track id)
            using (var db = new DataContext(conn))
            {
                var existing = db.Suppliers.FirstOrDefault(s => s.CompanyName == "Test Supplier");
                if (existing == null)
                {
                    var sup = new MAM.DataAccess.Tables.Supplier
                    {
                        CompanyName = "Test Supplier",
                        CreatedDate = DateTime.UtcNow
                    };
                    db.Suppliers.Add(sup);
                    db.SaveChanges();
                    result.SupplierIds.Add(sup.Id);
                }
            }

            // Ensure there is at least one hired property
            // Ensure there is at least one hired property (insert directly and track id)
            using (var db = new DataContext(conn))
            {
                var existing = db.HiredProperties.FirstOrDefault(h => h.PropertyCode == "P1");
                if (existing == null)
                {
                    var username = Environment.GetEnvironmentVariable("MAM_TEST_USERNAME") ?? GetUsernameFromUserSecrets();
                    username ??= "xxxxxx";
                    var user = db.Users.FirstOrDefault(u => u.Username == username) ?? db.Users.FirstOrDefault();
                    var userId = user?.Id ?? 1;

                    var now = DateTime.UtcNow;

                    var hp = new MAM.DataAccess.Tables.HiredProperty
                    {
                        Type = "Office",
                        District = "Test District",
                        PropertyCode = "TEST-P1",
                        BuildingCondition = "Good",
                        StartingDate = now,
                        TerminationDate = now.AddYears(1),
                        MonthlyRental = 15000,
                        StartRentalAmount = 15000,
                        Town = "Test Town",
                        Status = "Active",
                        UserDepartment = "Test Department",
                        LandlandAgentName = "Test Landlord",
                        LandlandAgentContactDetails = "0000000000",
                        NumberofStaff = 10,
                        EscalationRate = 5,
                        EscalationDate = now.AddYears(1),
                        Area = 250,
                        Address = "1 Test Street, Test Town",
                        IsDeteted = false,
                        CreatedUserId = userId,
                        CreatedDate = now,
                        ModifiedUserId = userId,
                        ModifiedDate = now
                    };

                    db.HiredProperties.Add(hp);
                    db.SaveChanges();

                    result.HiredPropertyIds.Add(hp.Id);
                }
            }

            // Ensure there is at least one camp (no public API to add camp - insert directly)
            using (var db = new DataContext(conn))
            {
                var existingCamp = db.Camps.FirstOrDefault(c => c.FileReference == "TEST");
                if (existingCamp == null)
                {
                    var username = Environment.GetEnvironmentVariable("MAM_TEST_USERNAME") ?? GetUsernameFromUserSecrets();
                    username ??= "xxxxxxxx";
                    var user = db.Users.FirstOrDefault(u => u.Username == username) ?? db.Users.FirstOrDefault();
                    var userId = user?.Id ?? 1;

                    var camp = new Camp
                    {
                        Department = "Test",
                        FileReference = "TEST",
                        Status = "Active",
                        UserId = userId,
                        CreatedDate = DateTime.UtcNow,
                        ModifiedBy = userId,
                        ModifiedDate = DateTime.UtcNow
                    };
                    db.Camps.Add(camp);
                    db.SaveChanges();
                    result.CampIds.Add(camp.Id);
                }
            }
            return result;
        }

        public static Task CleanupAsync(WebApplicationFactory<Program> factory, TestDatabaseSeedResult result)
        {
            var envConn = Environment.GetEnvironmentVariable("AppSettings__ConnectionString")
                          ?? Environment.GetEnvironmentVariable("MAM_TEST_CONNECTIONSTRING");
            var config = factory.Services.GetService(typeof(IConfiguration)) as IConfiguration;
            var conn = envConn ?? config?.GetSection("AppSettings")["ConnectionString"];
            if (string.IsNullOrWhiteSpace(conn))
                return Task.CompletedTask;

            using var db = new DataContext(conn);
            if (result.ProjectIds.Any())
            {
                var projects = db.Projects.Where(p => result.ProjectIds.Contains(p.Id)).ToList();
                if (projects.Any()) db.Projects.RemoveRange(projects);
            }
            if (result.SupplierIds.Any())
            {
                var suppliers = db.Suppliers.Where(s => result.SupplierIds.Contains(s.Id)).ToList();
                if (suppliers.Any()) db.Suppliers.RemoveRange(suppliers);
            }
            if (result.HiredPropertyIds.Any())
            {
                var hires = db.HiredProperties.Where(h => result.HiredPropertyIds.Contains(h.Id)).ToList();
                if (hires.Any()) db.HiredProperties.RemoveRange(hires);
            }
            if (result.CampIds.Any())
            {
                var camps = db.Camps.Where(c => result.CampIds.Contains(c.Id)).ToList();
                if (camps.Any()) db.Camps.RemoveRange(camps);
            }
            db.SaveChanges();
            return Task.CompletedTask;
        }

        private static string GetUsernameFromUserSecrets()
        {
            try
            {
                var appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
                var secretsRoot = System.IO.Path.Combine(appData, "Microsoft", "UserSecrets");
                if (System.IO.Directory.Exists(secretsRoot))
                {
                    foreach (var dir in System.IO.Directory.EnumerateDirectories(secretsRoot))
                    {
                        var secretsFile = System.IO.Path.Combine(dir, "secrets.json");
                        if (System.IO.File.Exists(secretsFile))
                        {
                            var json = System.IO.File.ReadAllText(secretsFile);
                            using var doc = System.Text.Json.JsonDocument.Parse(json);
                            if (doc.RootElement.TryGetProperty("username", out var userEl))
                                return userEl.GetString();
                        }
                    }
                }
            }
            catch { }
            return null;
        }
    }
}
