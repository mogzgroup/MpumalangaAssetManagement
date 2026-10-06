using System;
using System.Threading.Tasks;
using System.Net.Http.Json;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace MAM.API.Tests.Controllers
{
    public class ConditionAssessmentControllerTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;

        public ConditionAssessmentControllerTests(WebApplicationFactory<Program> factory)
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

        [Fact]
        public void ServerStarts()
        {
            var client = _factory.CreateClient();
            Assert.NotNull(client);
        }

        [Fact]
        public async System.Threading.Tasks.Task GetConditionAssessments_WithValidFacility_ReturnsOk()
        {
            var client = TestHelpers.TestAuthHelper.GetAuthenticatedClientAsync(_factory).GetAwaiter().GetResult();
            // Use a facility id that the test database seeder creates, or 0 to allow service to return empty
            var res = await client.GetAsync("/api/conditionassessment/getconditionassessments/0");
            res.EnsureSuccessStatusCode();
            var list = await res.Content.ReadFromJsonAsync<System.Collections.Generic.List<MAM.BusinessLayer.Models.ConditionAssessment>>();
            Assert.NotNull(list);
        }

        [Fact]
        public async System.Threading.Tasks.Task SaveConditionAssessment_WithValidModel_ReturnsId()
        {
            var client = TestHelpers.TestAuthHelper.GetAuthenticatedClientAsync(_factory).GetAwaiter().GetResult();

            var model = new MAM.BusinessLayer.Models.ConditionAssessment
            {
                Id = 0,
                // Use a safe FacilityId; test seeder should create at least one facility
                FacilityId = 1,
                CreatedDate = System.DateTime.UtcNow,
                CreatedBy = 1,
                Rates = new System.Collections.Generic.List<MAM.BusinessLayer.Models.Rate>
                {
                    new MAM.BusinessLayer.Models.Rate { Key = 1, Value = 1 },
                    new MAM.BusinessLayer.Models.Rate { Key = 2, Value = 1 },
                    new MAM.BusinessLayer.Models.Rate { Key = 3, Value = 1 },
                    new MAM.BusinessLayer.Models.Rate { Key = 4, Value = 1 },
                    new MAM.BusinessLayer.Models.Rate { Key = 5, Value = 1 },
                    new MAM.BusinessLayer.Models.Rate { Key = 6, Value = 1 },
                }
            };

            var res = await client.PostAsJsonAsync("/api/conditionassessment/saveConditionAssessment", model);
            res.EnsureSuccessStatusCode();
            var id = await res.Content.ReadFromJsonAsync<int>();
            Assert.True(id >= 0);
        }

        [Fact]
        public async System.Threading.Tasks.Task DeleteConditionAssessment_CreateAndDelete_ReturnsTrue()
        {
            var client = TestHelpers.TestAuthHelper.GetAuthenticatedClientAsync(_factory).GetAwaiter().GetResult();

            // Create a new condition assessment using the save endpoint
            var model = new MAM.BusinessLayer.Models.ConditionAssessment
            {
                Id = 0,
                FacilityId = 1,
                CreatedDate = System.DateTime.UtcNow,
                CreatedBy = 1,
                Rates = new System.Collections.Generic.List<MAM.BusinessLayer.Models.Rate>
                {
                    new MAM.BusinessLayer.Models.Rate { Key = 1, Value = 1 },
                    new MAM.BusinessLayer.Models.Rate { Key = 2, Value = 1 },
                    new MAM.BusinessLayer.Models.Rate { Key = 3, Value = 1 },
                    new MAM.BusinessLayer.Models.Rate { Key = 4, Value = 1 },
                    new MAM.BusinessLayer.Models.Rate { Key = 5, Value = 1 },
                    new MAM.BusinessLayer.Models.Rate { Key = 6, Value = 1 },
                }
            };

            var createRes = await client.PostAsJsonAsync("/api/conditionassessment/saveConditionAssessment", model);
            createRes.EnsureSuccessStatusCode();
            var createdId = await createRes.Content.ReadFromJsonAsync<int>();
            Assert.True(createdId > 0);

            // Now delete the created condition assessment
            var delRes = await client.DeleteAsync($"/api/conditionassessment/deleteConditionAssessment/{createdId}");
            delRes.EnsureSuccessStatusCode();
            var deleted = await delRes.Content.ReadFromJsonAsync<bool>();
            Assert.True(deleted);
        }

        [Fact]
        public async System.Threading.Tasks.Task GetConditionAssessments_WhenServiceThrows_ReturnsServerError()
        {
            var factory = _factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureTestServices(services =>
                {
                    services.AddScoped<MAM.API.Services.IConditionAssessmentService, ThrowingConditionAssessmentService>();
                });
            });

            var client = TestHelpers.TestAuthHelper.GetAuthenticatedClientAsync(factory).GetAwaiter().GetResult();
            var res = await client.GetAsync("/api/conditionassessment/getconditionassessments/0");
            Assert.Equal(System.Net.HttpStatusCode.InternalServerError, res.StatusCode);
        }

        private class ThrowingConditionAssessmentService : MAM.API.Services.IConditionAssessmentService
        {
            public int AddConditionAssessment(MAM.BusinessLayer.Models.ConditionAssessment ca) => throw new System.Exception("boom");
            public bool DeleteConditionAssessment(int id) => throw new System.Exception("boom");
            public System.Collections.Generic.List<MAM.BusinessLayer.Models.ConditionAssessment> GetConditionAssessments(int facilityId) => throw new System.Exception("boom");
        }
    }
}
