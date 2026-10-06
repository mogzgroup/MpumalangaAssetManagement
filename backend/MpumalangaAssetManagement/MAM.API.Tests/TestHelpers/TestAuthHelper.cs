using System;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MAM.BusinessLayer.Model;

namespace MAM.API.Tests.TestHelpers
{
    public static class TestAuthHelper
    {
        // Attempts to authenticate using environment variables MAM_TEST_USERNAME and MAM_TEST_PASSWORD.
        // If they are not set, falls back to generating a JWT using the AppSettings:Secret found in test host configuration.
        public static async Task<System.Net.Http.HttpClient> GetAuthenticatedClientAsync(WebApplicationFactory<Program> factory)
        {
            var client = factory.CreateClient();
            // Prefer values from user secrets file under %APPDATA%\Microsoft\UserSecrets
            string username = "xxxxxx";
            string password = "xxxxxx";
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
                            try
                            {
                                var json = System.IO.File.ReadAllText(secretsFile);
                                using var doc = System.Text.Json.JsonDocument.Parse(json);
                                if (doc.RootElement.TryGetProperty("username", out var userEl))
                                    username = userEl.GetString();
                                if (doc.RootElement.TryGetProperty("password", out var passEl))
                                    password = passEl.GetString();
                                break;
                            }
                            catch { /* ignore parse errors and continue */ }
                        }
                    }
                }
            }
            catch { /* non-fatal */ }

            // Fallback: look for a secrets.json file in the repository/test project folders (walk upward)
            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
            {
                try
                {
                    var dir = AppContext.BaseDirectory;
                    while (!string.IsNullOrEmpty(dir))
                    {
                        var secretsFile = System.IO.Path.Combine(dir, "secrets.json");
                        if (System.IO.File.Exists(secretsFile))
                        {
                            try
                            {
                                var json = System.IO.File.ReadAllText(secretsFile);
                                using var doc = System.Text.Json.JsonDocument.Parse(json);
                                if (doc.RootElement.TryGetProperty("username", out var userEl) && string.IsNullOrWhiteSpace(username))
                                    username = userEl.GetString();
                                if (doc.RootElement.TryGetProperty("password", out var passEl) && string.IsNullOrWhiteSpace(password))
                                    password = passEl.GetString();
                                break;
                            }
                            catch { }
                        }
                        var parent = System.IO.Directory.GetParent(dir);
                        dir = parent?.FullName;
                    }
                }
                catch { }
            }

            // If secrets.json did not provide values, fall back to environment variables
            if (string.IsNullOrWhiteSpace(username))
                username = Environment.GetEnvironmentVariable("MAM_TEST_USERNAME");
            if (string.IsNullOrWhiteSpace(password))
                password = Environment.GetEnvironmentVariable("MAM_TEST_PASSWORD");

            if (!string.IsNullOrWhiteSpace(username) && !string.IsNullOrWhiteSpace(password))
            {
                // Attempt real authenticate endpoint
                var res = await client.PostAsJsonAsync("/api/user/authenticate", new { Username = username, Password = password });
                if (!res.IsSuccessStatusCode)
                {
                    var body = await res.Content.ReadAsStringAsync();
                    throw new InvalidOperationException($"Test authentication failed with status {(int)res.StatusCode}: {body}");
                }

                var user = await res.Content.ReadFromJsonAsync<User>();
                if (user == null || user.Token == null)
                {
                    throw new InvalidOperationException("Authentication response did not include a token.");
                }

                string jwt = (string)user.Token;
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", jwt);
                return client;
            }

            // Fallback: generate token using configured secret so tests can run without a test user
            var config = factory.Services.GetRequiredService<IConfiguration>();
            var appSettingsSection = config.GetSection("AppSettings");
            var secret = appSettingsSection["Secret"] ?? appSettingsSection["JwtSecret"] ?? "test-secret-should-be-long-enough-to-meet-requirements-123456";
            var issuer = appSettingsSection["JwtIssuer"] ?? "MobileCentric";
            var audience = appSettingsSection["JwtAudience"] ?? "MobileCentricAPI";

            var tokenHandler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
            var key = System.Text.Encoding.UTF8.GetBytes(secret);
            var tokenDescriptor = new Microsoft.IdentityModel.Tokens.SecurityTokenDescriptor
            {
                Issuer = issuer,
                Audience = audience,
                Subject = new System.Security.Claims.ClaimsIdentity(new[] { new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Name, "1") }),
                Expires = DateTime.UtcNow.AddMinutes(30),
                SigningCredentials = new Microsoft.IdentityModel.Tokens.SigningCredentials(new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(key), Microsoft.IdentityModel.Tokens.SecurityAlgorithms.HmacSha256Signature)
            };
            var securityToken = tokenHandler.CreateToken(tokenDescriptor);
            var jwtTokenString = tokenHandler.WriteToken(securityToken);
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", jwtTokenString);
            return client;
        }
    }
}
