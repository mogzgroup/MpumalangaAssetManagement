using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using Microsoft.Extensions.Configuration;

namespace MAM.API.Tests.TestHelpers
{
    // Helper to load user secrets from %APPDATA%/Microsoft/UserSecrets/*/secrets.json
    // and map known keys into AppSettings:* so test WebApplicationFactory can rely on them.
    internal static class TestConfiguration
    {
        public static void AddUserSecretsToConfig(IConfigurationBuilder configBuilder)
        {
            try
            {
                var appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
                if (string.IsNullOrEmpty(appData)) return;

                var secretsRoot = Path.Combine(appData, "Microsoft", "UserSecrets");
                if (!Directory.Exists(secretsRoot)) return;

                var subdirs = Directory.GetDirectories(secretsRoot);
                foreach (var dir in subdirs)
                {
                    var secretsFile = Path.Combine(dir, "secrets.json");
                    if (!File.Exists(secretsFile)) continue;

                    var json = File.ReadAllText(secretsFile);
                    using var doc = JsonDocument.Parse(json);
                    var root = doc.RootElement;

                    var dict = new Dictionary<string, string?>(StringComparer.OrdinalIgnoreCase);

                    void MapIfPresent(string sourceKey, string targetKey)
                    {
                        if (root.TryGetProperty(sourceKey, out var prop) && prop.ValueKind == JsonValueKind.String)
                        {
                            dict[targetKey] = prop.GetString();
                        }
                        else if (root.TryGetProperty(sourceKey.ToLowerInvariant(), out prop) && prop.ValueKind == JsonValueKind.String)
                        {
                            dict[targetKey] = prop.GetString();
                        }
                    }

                    MapIfPresent("Secret", "AppSettings:Secret");
                    MapIfPresent("JwtIssuer", "AppSettings:JwtIssuer");
                    MapIfPresent("JwtAudience", "AppSettings:JwtAudience");
                    MapIfPresent("ConnectionString", "AppSettings:ConnectionString");
                    // Support top-level username/password in secrets.json used by tests
                    MapIfPresent("username", "MAM_TEST_USERNAME");
                    MapIfPresent("password", "MAM_TEST_PASSWORD");
                    MapIfPresent("WebAppURL", "AppSettings:WebAppURL");
                    MapIfPresent("UploadsFolder", "AppSettings:UploadsFolder");
                    MapIfPresent("EmailUserName", "AppSettings:EmailUserName");
                    MapIfPresent("EmailPassword", "AppSettings:EmailPassword");
                    MapIfPresent("EmailHost", "AppSettings:EmailHost");
                    MapIfPresent("FromEmailAddress", "AppSettings:FromEmailAddress");
                    MapIfPresent("AllowedOrigins", "AppSettings:AllowedOrigins");

                    // If we found at least one mapping, add them and stop searching further secrets files
                    var nonNull = dict.Where(kv => !string.IsNullOrEmpty(kv.Value)).ToDictionary(kv => kv.Key, kv => kv.Value!);
                    if (nonNull.Count > 0)
                    {
                        // Apply secrets via environment variables so tests don't require extra configuration packages
                        foreach (var kv in nonNull)
                        {
                            var envKey = kv.Key.Replace(':', '_'); // AppSettings:Secret -> AppSettings_Secret
                            Environment.SetEnvironmentVariable(envKey, kv.Value);
                        }
                        return;
                    }
                }
            }
            catch
            {
                // Fail silently — tests should fall back to other configuration sources if secrets aren't available.
            }
        }
    }
}
