using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http;
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
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using MAM.API.Services;
using MAM.BusinessLayer.Models;
using MAM.BusinessLayer.Model;
using Xunit;

namespace MAM.API.Tests
{
    public class IntegrationTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;

        public IntegrationTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory.WithWebHostBuilder(builder =>
            {
                builder.UseEnvironment("Test");
                // Load secrets from user secrets.json if available and avoid hardcoded values in tests
                builder.ConfigureAppConfiguration((context, conf) =>
                {
                    // First allow user secrets to populate AppSettings (applied as environment variables)
                    MAM.API.Tests.TestHelpers.TestConfiguration.AddUserSecretsToConfig(conf);

                    // If secrets are not present, ensure required keys exist with safe defaults
                    var fallback = new Dictionary<string, string?>
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

                // Use real services so tests exercise the configured test database
                // (Do not register test fakes here — tests should use configured services backed by the secrets-provided connection string)
            });
        }

        [Fact]
        public async Task ProtectedEndpoint_WithoutToken_Returns401()
        {
            var client = _factory.CreateClient();
            var response = await client.GetAsync("/api/project/getprojects");
            if (response.StatusCode != System.Net.HttpStatusCode.Unauthorized)
            {
                var body = await response.Content.ReadAsStringAsync();
                Assert.True(false, $"Expected 401 Unauthorized but got {(int)response.StatusCode} {response.StatusCode}. Response body: {body}");
            }
        }

        [Fact]
        public async Task Authenticate_InvalidCredentials_ReturnsBadRequest()
        {
            var client = _factory.CreateClient();
            var res = await client.PostAsJsonAsync("/api/user/authenticate", new { Username = "bad", Password = "bad" });
            if (res.StatusCode != System.Net.HttpStatusCode.BadRequest)
            {
                var body = await res.Content.ReadAsStringAsync();
                Assert.True(false, $"Expected 400 BadRequest but got {(int)res.StatusCode} {res.StatusCode}. Response body: {body}");
            }
        }

        [Fact]
        public async Task ProtectedEndpoint_WithValidJwt_Returns200AndData()
        {
            // Get configuration from the test server to generate a valid token
            var config = _factory.Services.GetRequiredService<IConfiguration>();
            var appSettingsSection = config.GetSection("AppSettings");
            var secret = appSettingsSection["Secret"] ?? "development-secret-should-be-long-enough-to-meet-requirements-123456";
            var issuer = appSettingsSection["JwtIssuer"] ?? "MobileCentric";
            var audience = appSettingsSection["JwtAudience"] ?? "MobileCentricAPI";

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(secret);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Issuer = issuer,
                Audience = audience,
                Subject = new ClaimsIdentity(new[] { new Claim(ClaimTypes.Name, "1") }),
                Expires = DateTime.UtcNow.AddMinutes(30),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            var client = _factory.CreateClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokenString);

            var res = await client.GetAsync("/api/project/getprojects");
            if (res.StatusCode != System.Net.HttpStatusCode.OK)
            {
                var body = await res.Content.ReadAsStringAsync();
                Assert.True(false, $"Expected 200 OK but got {(int)res.StatusCode} {res.StatusCode}. Response body: {body}");
            }

            var projects = await res.Content.ReadFromJsonAsync<List<Project>>();
            Assert.NotNull(projects);
        }

        // Tests use real services against the configured database
            public bool DeleteUser(User user) => true;
            public List<User> GetAll() => new List<User>();
            public User Authenticate(string username, string password)
            {
                // simple fake: return a user only for known test credentials
                if (username == "test" && password == "password")
                {
                    return new User { Id = 1, Username = "test", Token = "FAKE" };
                }
                return null;
            }
            public bool ForgotPassword(string username, string newPassword) => true;
            public bool ResetPassword(string username, string newPassword) => true;
            public bool UpdateUser(User user) => true;
        }
    }

    // Lightweight test doubles for services to avoid database dependency in integration tests
    public class TestProjectService : MAM.API.Services.IProjectService
    {
        public int AddProject(MAM.BusinessLayer.Models.Project project) => 1;
        public bool DeleteProject(MAM.BusinessLayer.Models.Project project) => true;
        public MAM.BusinessLayer.Models.Project UpdateProject(MAM.BusinessLayer.Models.Project project) => project;
        public System.Collections.Generic.List<MAM.BusinessLayer.Models.Project> GetProjects()
        {
            return new System.Collections.Generic.List<MAM.BusinessLayer.Models.Project>
            {
                new MAM.BusinessLayer.Models.Project { Id = 1, Name = "Test Project" }
            };
        }
    }



