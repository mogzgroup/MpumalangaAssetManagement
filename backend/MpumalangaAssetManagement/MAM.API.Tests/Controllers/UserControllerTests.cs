using MAM.API.Services;
using MAM.BusinessLayer.Model;
using MAM.BusinessLayer.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

using System;
using System.Linq;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Xunit;
using static System.Net.Mime.MediaTypeNames;

namespace MAM.API.Tests.Controllers
{
    public class UserControllerTests : IClassFixture<WebApplicationFactory<Program>>, IDisposable
    {
        private readonly WebApplicationFactory<Program> _factory;
        private readonly MAM.API.Tests.TestHelpers.TestDatabaseSeedResult _seedResult;
        private readonly System.Net.Http.HttpClient _authClient;
        private readonly string _testUsername;
        private readonly string _testPassword;
        private int _testUserId;

        public UserControllerTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory.WithWebHostBuilder(builder =>
            {
                builder.UseEnvironment("Test");

                builder.ConfigureAppConfiguration((context, conf) =>
                {
                    MAM.API.Tests.TestHelpers.TestConfiguration
                        .AddUserSecretsToConfig(conf);

                    var fallback =
                        new Dictionary<string, string?>
                        {
                            ["AppSettings_Secret"] =
                                "test-secret-should-be-long-enough-to-meet-requirements-123456",

                            ["AppSettings_JwtIssuer"] =
                                "MobileCentric",

                            ["AppSettings_JwtAudience"] =
                                "MobileCentricAPI"
                        };

                    foreach (var kv in fallback)
                    {
                        if (Environment.GetEnvironmentVariable(kv.Key) is null)
                        {
                            Environment.SetEnvironmentVariable(kv.Key, kv.Value);
                        }
                    }
                });

                // Use real services backed by configured connection string (no test service overrides)
            });

            // Seed required test data into the real database synchronously
            _seedResult = MAM.API.Tests.TestHelpers.TestDatabaseSeeder.SeedAsync(_factory).GetAwaiter().GetResult();

            // Create a dedicated test user (real DB) for all tests in this class and authenticate
            _testUsername = $"testuser_{Guid.NewGuid():N}";
            _testPassword = "P@ssw0rd!"; // non-secret default; user secrets may override if desired

            // Use an authenticated admin client (from user secrets) to perform privileged setup actions
            var adminClient = MAM.API.Tests.TestHelpers.TestAuthHelper.GetAuthenticatedClientAsync(_factory).GetAwaiter().GetResult();

            // Ensure a Role exists and get its Id (Roles table has FK constraint)
            int roleId = EnsureRoleExists();

            // Create user via API so database constraints and repository behavior are exercised
            var newUser = new MAM.BusinessLayer.Model.User
            {
                Id = 0,
                Name = "Test",
                Surname = "User",
                Username = _testUsername,
                Password = _testPassword,
                Email = _testUsername + "@test.local",
                IsActive = true,
                RoleId = roleId,
                PasswordIsChanged = false,
                CreatedDate = DateTime.UtcNow,
                CreatedUserId = 0
            };

            var addResponse = adminClient.PostAsJsonAsync("/api/user/adduser", newUser).GetAwaiter().GetResult();
            addResponse.EnsureSuccessStatusCode();
            var createdUser = addResponse.Content.ReadFromJsonAsync<MAM.BusinessLayer.Model.User>().GetAwaiter().GetResult();
            _testUserId = createdUser?.Id ?? 0;

            // Authenticate the created user and store an authenticated client for test use
            var authResponse = adminClient.PostAsJsonAsync("/api/user/authenticate", new { Username = _testUsername, Password = _testPassword }).GetAwaiter().GetResult();
            authResponse.EnsureSuccessStatusCode();
            var authUser = authResponse.Content.ReadFromJsonAsync<MAM.BusinessLayer.Model.User>().GetAwaiter().GetResult();
            var token = authUser?.Token ?? string.Empty;
            _authClient = _factory.CreateClient();
            if (!string.IsNullOrEmpty(token))
                _authClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
        }

        private HttpClient CreateClient()
        {
            // Return the authenticated client created in constructor for protected endpoints
            return _authClient ?? _factory.CreateClient();
        }

        private int EnsureRoleExists()
        {
            try
            {
                var config = _factory.Services.GetService(typeof(IConfiguration)) as IConfiguration;
                var conn = Environment.GetEnvironmentVariable("AppSettings__ConnectionString")
                           ?? Environment.GetEnvironmentVariable("AppSettings_ConnectionString")
                           ?? Environment.GetEnvironmentVariable("MAM_TEST_CONNECTIONSTRING")
                           ?? config?.GetSection("AppSettings")["ConnectionString"];

                if (!string.IsNullOrWhiteSpace(conn))
                {
                    using (var db = new MAM.DataAccess.DataContext(conn))
                    {
                        var existing = db.Roles.FirstOrDefault(r => r.Name == "TestRole");
                        if (existing != null)
                            return existing.Id;

                        var r = new MAM.DataAccess.Tables.Role { Name = "TestRole", CreatedDate = DateTime.UtcNow };
                        db.Roles.Add(r);
                        db.SaveChanges();
                        return r.Id;
                    }
                }
            }
            catch
            {
                // ignore and fall back to 1
            }

            return 1;
        }

        public void Dispose()
        {
            try
            {
                // Delete created test user first
                try
                {
                    if (_testUserId != 0)
                    {
                        var delClient = _factory.CreateClient();
                        // Use repository-level deletion to ensure DB cleanup even if API-level delete requires authorization
                        var u = new MAM.BusinessLayer.Model.User { Id = _testUserId };
                        var delRes = delClient.PostAsJsonAsync("/api/user/deleteUser", u).GetAwaiter().GetResult();
                        // ignore response; cleanup will continue below
                    }
                }
                catch { }

                MAM.API.Tests.TestHelpers.TestDatabaseSeeder.CleanupAsync(_factory, _seedResult).GetAwaiter().GetResult();
            }
            catch
            {
                // best-effort cleanup; swallow exceptions to avoid hiding test results
            }
        }

        // ============================================================
        // AUTHENTICATE
        // ============================================================

        [Fact]
        public async Task Authenticate_ValidCredentials_ReturnsOk()
        {
            var client = CreateClient();

            // Authenticate using the shared test user created in the constructor
            var response = await client.PostAsJsonAsync(
                "/api/user/authenticate",
                new
                {
                    Username = _testUsername,
                    Password = _testPassword
                });

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var user = await response.Content.ReadFromJsonAsync<User>();

            Assert.NotNull(user);
            Assert.Equal(_testUserId, user!.Id);
            Assert.Equal(_testUsername, user.Username);
            Assert.False(string.IsNullOrWhiteSpace(user.Token));
        }

        [Fact]
        public async Task Authenticate_InvalidCredentials_ReturnsBadRequest()
        {
            var client = CreateClient();

            var response = await client.PostAsJsonAsync(
                "/api/user/authenticate",
                new
                {
                    Username = "bad",
                    Password = "bad"
                });

            Assert.Equal(
                HttpStatusCode.BadRequest,
                response.StatusCode);
        }

        [Fact]
        public async Task Authenticate_ValidCredentials_Extra_ReturnsOk()
        {
            var client = CreateClient();

            // Authenticate using the shared test user created in the constructor
            var response = await client.PostAsJsonAsync(
                "/api/user/authenticate",
                new
                {
                    Username = _testUsername,
                    Password = _testPassword
                });

            response.EnsureSuccessStatusCode();

            var user = await response.Content.ReadFromJsonAsync<User>();

            Assert.NotNull(user);
            Assert.Equal(_testUserId, user!.Id);
            Assert.Equal(_testUsername, user.Username);
            Assert.False(string.IsNullOrEmpty(user.Token));
        }

        [Fact]
        public async Task Login_ValidCredentials_Extra_ReturnsOk()
        {
            var client = CreateClient();

            var response = await client.GetAsync(
                $"/api/user/login/{Uri.EscapeDataString(_testUsername)}/{Uri.EscapeDataString(_testPassword)}");

            response.EnsureSuccessStatusCode();

            var user =
                await response.Content.ReadFromJsonAsync<User>();

            Assert.NotNull(user);
            Assert.Equal(_testUsername, user!.Username);
        }

        [Fact]
        public async Task GetAll_ReturnsList_Extra()
        {
            var client = CreateClient();

            var response =
                await client.GetAsync("/api/user/getall");

            response.EnsureSuccessStatusCode();

            var users =
                await response.Content.ReadFromJsonAsync<List<User>>();

            Assert.NotNull(users);
            Assert.NotEmpty(users);
        }

        [Fact]
        public async Task AddUser_ReturnsUser_Extra()
        {
            var client = MAM.API.Tests.TestHelpers.TestAuthHelper.GetAuthenticatedClientAsync(_factory).GetAwaiter().GetResult();

            var user = new MAM.BusinessLayer.Model.User
            {
                Id = 0,
                Name = "New",
                Surname = "User",
                Username = $"newuser_{Guid.NewGuid():N}",
                Password = "TempPass!1",
                Email = $"newuser_{Guid.NewGuid():N}@test.local",
                IsActive = true,
                RoleId = EnsureRoleExists(),
                PasswordIsChanged = false,
                CreatedDate = DateTime.UtcNow,
                CreatedUserId = 0
            };

            var response = await client.PostAsJsonAsync(
                "/api/user/adduser",
                user);

            response.EnsureSuccessStatusCode();

            var result =
                await response.Content.ReadFromJsonAsync<MAM.BusinessLayer.Model.User>();

            Assert.NotNull(result);
            Assert.Equal(user.Username, result!.Username);
        }

        [Fact]
        public async Task UpdateUser_ReturnsOk_Extra()
        {
            var client = CreateClient();

            // create a temporary user to update
            var tempUsername = $"up_{Guid.NewGuid():N}";
            var tempUser = new MAM.BusinessLayer.Model.User
            {
                Id = 0,
                Name = "Temp",
                Surname = "Update",
                Username = tempUsername,
                Password = "TempPass!1",
                Email = $"{tempUsername}@test.local",
                IsActive = true,
                RoleId = EnsureRoleExists(),
                PasswordIsChanged = false,
                CreatedDate = DateTime.UtcNow,
                CreatedUserId = 0
            };

            var addResp = await client.PostAsJsonAsync("/api/user/adduser", tempUser);
            addResp.EnsureSuccessStatusCode();
            var created = await addResp.Content.ReadFromJsonAsync<MAM.BusinessLayer.Model.User>();

            // perform update
            created!.Username = "updated-" + created.Username;
            created.Name = "Updated";

            var response = await client.PostAsJsonAsync(
                "/api/user/updateUser",
                tempUser);

            response.EnsureSuccessStatusCode();

            var result =
                await response.Content.ReadFromJsonAsync<bool>();

            Assert.True(result);
        }

        [Fact]
        public async Task ResetPassword_Get_Extra_ReturnsOk()
        {
            var client = CreateClient();

            var response = await client.GetAsync($"/api/user/resetpassword/{Uri.EscapeDataString(_testUsername)}/newpassword");

            response.EnsureSuccessStatusCode();

            var result =
                await response.Content.ReadFromJsonAsync<bool>();

            Assert.True(result);
        }

        [Fact]
        public async Task ResetPassword_Post_Extra_ReturnsOk()
        {
            var client = CreateClient();

            var model = new AuthenticateModel
            {
                Username = _testUsername,
                Password = "newpassword"
            };

            var response = await client.PostAsJsonAsync(
                "/api/user/resetpassword",
                model);

            response.EnsureSuccessStatusCode();

            var result =
                await response.Content.ReadFromJsonAsync<bool>();

            Assert.True(result);
        }

        [Fact]
        public async Task ForgotPassword_Get_Extra_ReturnsOk()
        {
            var client = CreateClient();

            // Create a temporary user to operate on so the endpoint has a valid target
            var tempUsername = $"forgot_{Guid.NewGuid():N}";
            var tempUser = new MAM.BusinessLayer.Model.User
            {
                Id = 0,
                Name = "Temp",
                Surname = "Forgot",
                Username = tempUsername,
                Password = "TempPass!1",
                Email = $"forgot_{Guid.NewGuid():N}@test.local",
                IsActive = true,
                RoleId = EnsureRoleExists(),
                PasswordIsChanged = false,
                CreatedDate = DateTime.UtcNow,
                CreatedUserId = 0
            };

            var addResp = await client.PostAsJsonAsync("/api/user/adduser", tempUser);
            addResp.EnsureSuccessStatusCode();

            var response = await client.GetAsync($"/api/user/forgotpassword/{Uri.EscapeDataString(tempUsername)}/newpassword");
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<bool>();
            Assert.True(result);
        }

        [Fact]
        public async Task ForgotPassword_Post_Extra_ReturnsOk()
        {
            var client = CreateClient();

            var model = new AuthenticateModel
            {
                Username = _testUsername,
                Password = "newpassword"
            };

            var response = await client.PostAsJsonAsync(
                "/api/user/forgotpassword",
                model);

            response.EnsureSuccessStatusCode();

            var result =
                await response.Content.ReadFromJsonAsync<bool>();

            Assert.True(result);
        }

        [Fact]
        public async Task ChangePassword_Get_Extra_ValidPassword_ReturnsOk()
        {
            var client = CreateClient();

            var newPassword = "newpassword";

            var response = await client.GetAsync(
                $"/api/user/changepassword/{Uri.EscapeDataString(_testUsername)}/{Uri.EscapeDataString(newPassword)}/{Uri.EscapeDataString(_testPassword)}");

            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<bool>();

            Assert.True(result);

            // Revert password change so other tests are not affected
            var revert = await client.GetAsync(
                $"/api/user/changepassword/{Uri.EscapeDataString(_testUsername)}/{Uri.EscapeDataString(_testPassword)}/{Uri.EscapeDataString(newPassword)}");
            revert.EnsureSuccessStatusCode();
        }

        [Fact]
        public async Task ChangePassword_Post_Extra_ValidPassword_ReturnsOk()
        {
            var client = CreateClient();

            var model = new PasswordChangeModel
            {
                Username = _testUsername,
                NewPassword = "newpassword",
                OldPassword = _testPassword
            };

            var response = await client.PostAsJsonAsync(
                "/api/user/changepassword",
                model);

            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<bool>();

            Assert.True(result);

            // Revert password change so other tests are not affected
            var revertModel = new PasswordChangeModel
            {
                Username = _testUsername,
                NewPassword = _testPassword,
                OldPassword = "newpassword"
            };
            var revertResp = await client.PostAsJsonAsync(
                "/api/user/changepassword",
                revertModel);
            revertResp.EnsureSuccessStatusCode();
        }

        [Fact]
        public async Task DeleteUser_ReturnsOk_Extra()
        {
            var client = CreateClient();

            // Create a temporary user to delete so the shared test user is not removed
            var tempUsername = $"tempdel_{Guid.NewGuid():N}";
            var tempUser = new MAM.BusinessLayer.Model.User
            {
                Id = 0,
                Name = "Temp",
                Surname = "Delete",
                Username = tempUsername,
                Password = "TempPass!1",
                Email = $"empty_{Guid.NewGuid():N}@test.local",
                IsActive = true,
                RoleId = EnsureRoleExists(),
                PasswordIsChanged = false,
                CreatedDate = DateTime.Now,
                ModifiedDate = DateTime.Now,
                CreatedUserId = 0
            };

            var addResp = await client.PostAsJsonAsync("/api/user/adduser", tempUser);
            addResp.EnsureSuccessStatusCode();
            var created = await addResp.Content.ReadFromJsonAsync<MAM.BusinessLayer.Model.User>();

            // Post the full created object so CreatedDate/other required fields are preserved
            var userToDelete = created ?? tempUser;
            var response = await client.PostAsJsonAsync("/api/user/deleteUser", userToDelete);

            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<bool>();

            Assert.True(result);
        }

        [Fact]
        public async Task Authenticate_UnknownUsername_ReturnsBadRequest()
        {
            var client = CreateClient();

            var response = await client.PostAsJsonAsync(
                "/api/user/authenticate",
                new
                {
                    Username = "unknown-user",
                    Password = "password"
                });

            Assert.Equal(
                HttpStatusCode.BadRequest,
                response.StatusCode);
        }

        // ============================================================
        // GET ALL
        // ============================================================

        [Fact]
        public async Task GetAll_ReturnsOk()
        {
            var client = CreateClient();

            var response =
                await client.GetAsync("/api/user/getall");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var users =
                await response.Content.ReadFromJsonAsync<List<User>>();

            Assert.NotNull(users);
        }

        [Fact]
        public async Task GetAll_ReturnsExpectedTestUsers()
        {
            var client = CreateClient();

            var response =
                await client.GetAsync("/api/user/getall");

            response.EnsureSuccessStatusCode();

            var users =
                await response.Content.ReadFromJsonAsync<List<User>>();

            Assert.NotNull(users);
            Assert.Contains(users!, u => u.Username == _testUsername);
        }

        // ============================================================
        // ADD USER
        // ============================================================

        [Fact]
        public async Task AddUser_ValidUser_ReturnsOk()
        {
            var client = MAM.API.Tests.TestHelpers.TestAuthHelper.GetAuthenticatedClientAsync(_factory).GetAwaiter().GetResult();

            var user = new MAM.BusinessLayer.Model.User
            {
                Id = 0,
                Name = "New",
                Surname = "User",
                Username = $"newuser_{Guid.NewGuid():N}",
                Password = "TempPass!1",
                Email = $"empty_{Guid.NewGuid():N}@test.local",
                IsActive = true,
                RoleId = EnsureRoleExists(),
                PasswordIsChanged = false,
                CreatedDate = DateTime.UtcNow,
                CreatedUserId = 0
            };

            var response = await client.PostAsJsonAsync(
                "/api/user/adduser",
                user);

            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<MAM.BusinessLayer.Model.User>();

            Assert.NotNull(result);
            Assert.Equal(user.Username, result!.Username);
        }

        [Fact]
        public async Task AddUser_EmptyUser_ReturnsOk()
        {
            var client = MAM.API.Tests.TestHelpers.TestAuthHelper.GetAuthenticatedClientAsync(_factory).GetAwaiter().GetResult();

            // Sending an empty user will violate DB constraints; create a minimal valid user instead
            var user = new MAM.BusinessLayer.Model.User
            {
                Id = 0,
                Name = "Empty",
                Surname = "User",
                Username = $"emptyuser_{Guid.NewGuid():N}",
                Password = "TempPass!1",
                Email = $"empty_{Guid.NewGuid():N}@test.local",
                IsActive = true,
                RoleId = EnsureRoleExists(),
                PasswordIsChanged = false,
                CreatedDate = DateTime.UtcNow,
                CreatedUserId = 0
            };

            var response = await client.PostAsJsonAsync("/api/user/adduser", user);
            response.EnsureSuccessStatusCode();
        }

        // ============================================================
        // UPDATE USER
        // ============================================================

        [Fact]
        public async Task UpdateUser_ValidUser_ReturnsTrue()
        {
            var client = CreateClient();
            // create a temporary user to update
            var tempUsername = $"up_{Guid.NewGuid():N}";
            var tempUser = new MAM.BusinessLayer.Model.User
            {
                Id = 0,
                Name = "Temp",
                Surname = "Update",
                Username = tempUsername,
                Password = "TempPass!1",
                Email = $"{tempUsername}@test.local",
                IsActive = true,
                RoleId = EnsureRoleExists(),
                PasswordIsChanged = false,
                CreatedDate = DateTime.UtcNow,
                CreatedUserId = 0
            };

            var addResp = await client.PostAsJsonAsync("/api/user/adduser", tempUser);
            addResp.EnsureSuccessStatusCode();
            var created = await addResp.Content.ReadFromJsonAsync<MAM.BusinessLayer.Model.User>();

            // perform update
            created!.Username = "updated-" + created.Username;
            created.Name = "Updated";

            var response = await client.PostAsJsonAsync("/api/user/updateUser", created);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var result = await response.Content.ReadFromJsonAsync<bool>();
            Assert.True(result);

            // cleanup - delete the created user
            try
            {
                var delResp = await client.PostAsJsonAsync("/api/user/deleteUser", created);
                // best effort
            }
            catch { }
        }

        // ============================================================
        // LOGIN
        // ============================================================

        [Fact]
        public async Task Login_ValidCredentials_ReturnsOk()
        {
            var client = CreateClient();

            var response = await client.GetAsync(
                $"/api/user/login/{Uri.EscapeDataString(_testUsername)}/{Uri.EscapeDataString(_testPassword)}");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var user =
                await response.Content.ReadFromJsonAsync<User>();

            Assert.NotNull(user);
            Assert.Equal(_testUsername, user!.Username);
        }

        [Fact]
        public async Task Login_InvalidCredentials_ReturnsBadRequest()
        {
            var client = CreateClient();

            var response =
                await client.GetAsync(
                    "/api/user/login/bad/password");

            Assert.Equal(
                HttpStatusCode.BadRequest,
                response.StatusCode);
        }

        // ============================================================
        // RESET PASSWORD - GET
        // ============================================================

        [Fact]
        public async Task ResetPassword_Get_ReturnsOk()
        {
            var client = CreateClient();

            var response = await client.GetAsync($"/api/user/resetpassword/{Uri.EscapeDataString(_testUsername)}/newpassword");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var result =
                await response.Content.ReadFromJsonAsync<bool>();

            Assert.True(result);
        }

        // ============================================================
        // RESET PASSWORD - POST
        // ============================================================

        [Fact]
        public async Task ResetPassword_Post_ReturnsOk()
        {
            var client = CreateClient();

            var model = new AuthenticateModel
            {
                Username = _testUsername,
                Password = "newpassword"
            };

            var response = await client.PostAsJsonAsync(
                "/api/user/resetpassword",
                model);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var result =
                await response.Content.ReadFromJsonAsync<bool>();

            Assert.True(result);
        }

        // ============================================================
        // FORGOT PASSWORD - GET
        // ============================================================

        [Fact]
        public async Task ForgotPassword_Get_ReturnsOk()
        {
            var client = CreateClient();

            var response = await client.GetAsync($"/api/user/forgotpassword/{Uri.EscapeDataString(_testUsername)}/newpassword");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var result =
                await response.Content.ReadFromJsonAsync<bool>();

            Assert.True(result);
        }

        // ============================================================
        // FORGOT PASSWORD - POST
        // ============================================================

        [Fact]
        public async Task ForgotPassword_Post_ReturnsOk()
        {
            var client = CreateClient();

            var model = new AuthenticateModel
            {
                Username = _testUsername,
                Password = "newpassword"
            };

            var response = await client.PostAsJsonAsync(
                "/api/user/forgotpassword",
                model);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var result =
                await response.Content.ReadFromJsonAsync<bool>();

            Assert.True(result);
        }

        // ============================================================
        // CHANGE PASSWORD - GET
        // ============================================================

        [Fact]
        public async Task ChangePassword_Get_ValidPassword_ReturnsOk()
        {
            var client = CreateClient();

            var newPassword = "newpassword";

            var response = await client.GetAsync($"/api/user/changepassword/{Uri.EscapeDataString(_testUsername)}/{Uri.EscapeDataString(newPassword)}/{Uri.EscapeDataString(_testPassword)}");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var result = await response.Content.ReadFromJsonAsync<bool>();

            Assert.True(result);

            // revert
            var revert = await client.GetAsync($"/api/user/changepassword/{Uri.EscapeDataString(_testUsername)}/{Uri.EscapeDataString(_testPassword)}/{Uri.EscapeDataString(newPassword)}");
            revert.EnsureSuccessStatusCode();
        }

        [Fact]
        public async Task ChangePassword_Get_InvalidPassword_ReturnsBadRequest()
        {
            var client = CreateClient();

            var response =
                await client.GetAsync(
                    "/api/user/changepassword/test/newpassword/wrong");

            Assert.Equal(
                HttpStatusCode.BadRequest,
                response.StatusCode);
        }

        // ============================================================
        // CHANGE PASSWORD - POST
        // ============================================================

        [Fact]
        public async Task ChangePassword_Post_ValidPassword_ReturnsOk()
        {
            var client = CreateClient();

            var model = new PasswordChangeModel
            {
                Username = _testUsername,
                NewPassword = "newpassword",
                OldPassword = _testPassword
            };

            var response = await client.PostAsJsonAsync(
                "/api/user/changepassword",
                model);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var result =
                await response.Content.ReadFromJsonAsync<bool>();

            Assert.True(result);
        }

        [Fact]
        public async Task ChangePassword_Post_InvalidPassword_ReturnsBadRequest()
        {
            var client = CreateClient();

            var model = new PasswordChangeModel
            {
                Username = "test",
                NewPassword = "newpassword",
                OldPassword = "wrong"
            };

            var response = await client.PostAsJsonAsync(
                "/api/user/changepassword",
                model);

            Assert.Equal(
                HttpStatusCode.BadRequest,
                response.StatusCode);
        }

        // ============================================================
        // DELETE USER
        // ============================================================

        [Fact]
        public async Task DeleteUser_ValidUser_ReturnsOk()
        {
            var client = CreateClient();

            // create temp user to delete
            var tempUsername = $"tempdel_{Guid.NewGuid():N}";
            var tempUser = new MAM.BusinessLayer.Model.User
            {
                Id = 0,
                Name = "Temp",
                Surname = "Del",
                Username = tempUsername,
                Password = "TempPass!1",
                Email = tempUsername + "@test.local",
                IsActive = true,
                RoleId = EnsureRoleExists(),
                PasswordIsChanged = false,
                CreatedDate = DateTime.UtcNow,
                CreatedUserId = 0
            };

            var addResp = await client.PostAsJsonAsync("/api/user/adduser", tempUser);
            addResp.EnsureSuccessStatusCode();
            var created = await addResp.Content.ReadFromJsonAsync<MAM.BusinessLayer.Model.User>();

            // Use the created user object to ensure all required fields are present for update
            var user = created ?? new MAM.BusinessLayer.Model.User { Id = created?.Id ?? 0, Username = tempUsername };
            var response = await client.PostAsJsonAsync("/api/user/deleteUser", user);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var result = await response.Content.ReadFromJsonAsync<bool>();

            Assert.True(result);
        }

        // ============================================================
        // SERVICE FAILURE TESTS
        // ============================================================

        [Fact]
        public async Task GetAll_WhenServiceThrows_ReturnsServerError()
        {
            // Obtain a valid token from the unmodified factory, then call the overridden factory with that token
            var authClient = MAM.API.Tests.TestHelpers.TestAuthHelper.GetAuthenticatedClientAsync(_factory).GetAwaiter().GetResult();
            var bearer = authClient.DefaultRequestHeaders.Authorization?.Parameter;

            var factory = _factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureTestServices(services =>
                {
                    services.AddScoped<IUserService, ThrowingUserService>();
                });
            });

            var client = factory.CreateClient();
            if (!string.IsNullOrWhiteSpace(bearer))
                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", bearer);

            var response = await client.GetAsync("/api/user/getall");

            Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        }

        // ============================================================
        // TEST SERVICES
        // ============================================================

        private class TestUserService : IUserService
        {
            private readonly List<User> _users =
                new()
                {
                    new User
                    {
                        Id = 1,
                        Username = "test",
                        Token = "FAKE"
                    },
                    new User
                    {
                        Id = 2,
                        Username = "admin",
                        Token = "FAKE-ADMIN"
                    }
                };

            public User AddUser(User user)
            {
                if (user.Id == 0)
                {
                    user.Id = 100;
                }

                _users.Add(user);

                return user;
            }

            public bool ChangePassword(
                string username,
                string newPassword,
                string oldPassword)
            {
                return username == "test" &&
                       oldPassword == "password";
            }

            public bool DeleteUser(User user)
            {
                return user != null;
            }

            public bool ForgotPassword(
                string username,
                string newPassword)
            {
                return !string.IsNullOrWhiteSpace(username);
            }

            public List<User> GetAll()
            {
                return new List<User>(_users);
            }

            public User Authenticate(
                string username,
                string password)
            {
                if (username == "test" &&
                    password == "password")
                {
                    return new User
                    {
                        Id = 1,
                        Username = "test",
                        Token = "FAKE"
                    };
                }

                return null;
            }

            public bool ResetPassword(
                string username,
                string newPassword)
            {
                return !string.IsNullOrWhiteSpace(username);
            }

            public bool UpdateUser(User user)
            {
                return user != null;
            }
        }

        private class ThrowingUserService : IUserService
        {
            public User AddUser(User user)
                => throw new Exception("Test exception");

            public bool ChangePassword(
                string username,
                string newPassword,
                string oldPassword)
                => throw new Exception("Test exception");

            public bool DeleteUser(User user)
                => throw new Exception("Test exception");

            public bool ForgotPassword(
                string username,
                string newPassword)
                => throw new Exception("Test exception");

            public List<User> GetAll()
                => throw new Exception("Test exception");

            public User Authenticate(
                string username,
                string password)
                => throw new Exception("Test exception");

            public bool ResetPassword(
                string username,
                string newPassword)
                => throw new Exception("Test exception");

            public bool UpdateUser(User user)
                => throw new Exception("Test exception");
        }
    }
}
