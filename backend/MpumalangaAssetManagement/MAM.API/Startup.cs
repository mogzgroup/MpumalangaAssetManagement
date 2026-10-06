using Microsoft.Extensions.Hosting;
using System;
using System.IO;
using System.Text;
using MAM.API.Services;
using MAM.BusinessLayer.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
namespace MAM.API
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            //services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_2);
            services.AddControllers()
                .AddNewtonsoftJson();

            // Swagger - register without modifying global service collection during options creation
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "MAM API",
                    Version = "v1",
                });
                c.CustomSchemaIds(type => type.FullName.Replace("+", "."));

                // Add JWT bearer definition so Swagger UI can send Authorization: Bearer <token>
                var securityScheme = new OpenApiSecurityScheme
                {
                    Description = "JWT Authorization header using the Bearer scheme. Example: 'Bearer {token}'",
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT"
                };

                c.AddSecurityDefinition("Bearer", securityScheme);
            });

            // Require authentication by default for all endpoints; allow anonymous on specific actions with [AllowAnonymous]
            services.AddAuthorization(options =>
            {
                // FallbackPolicy will apply to all endpoints that do not have an [AllowAnonymous] attribute
                options.FallbackPolicy = new Microsoft.AspNetCore.Authorization.AuthorizationPolicyBuilder()
                    .RequireAuthenticatedUser()
                    .Build();
            });

            // Strongly typed settings
            var appSettingsSection = Configuration.GetSection("AppSettings");
            var appSettings = appSettingsSection.Get<AppSettings>() ?? new AppSettings();
            ValidateAppSettings(appSettings);
            services.Configure<AppSettings>(appSettingsSection);
            // Register AppSettings instance so it can be injected directly where required
            services.AddSingleton(appSettings);
            var key = Encoding.UTF8.GetBytes(appSettings.Secret);
            services.AddSingleton<UploadStorage>();

            services.AddCors(options => options.AddPolicy("ConfiguredOrigins", policy =>
            {
                var allowedOrigins = appSettings.AllowedOrigins ?? Array.Empty<string>();
                if (allowedOrigins.Length == 0)
                {
                    policy.SetIsOriginAllowed(_ => false);
                    return;
                }

                policy.WithOrigins(allowedOrigins)
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials();
            }));

            // JWT auth
            services.AddAuthentication(x =>
            {
                x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(x =>
            {
                x.RequireHttpsMetadata = true;
                x.SaveToken = true;
                x.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidIssuer = appSettings.JwtIssuer,
                    ValidAudience = appSettings.JwtAudience,
                };
            });

            // Register services
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IFacilityService, FacilityService>();
            services.AddScoped<IUAMPService, UAMPService>();
            services.AddScoped<IConditionAssessmentService, ConditionAssessmentService>();
            services.AddScoped<ILeaseManagementService, LeaseManagementService>();
            services.AddScoped<IHiringRegisterService, HiringRegisterService>();
            services.AddScoped<IFaultService, FaultService>();
            services.AddScoped<IProjectService, ProjectService>();
            services.AddScoped<ISupplierService, SupplierService>();
            services.AddScoped<ICampService, CampService>();

            // Data access repositories - inject with configured connection string
            services.AddScoped<MAM.DataAccess.Interfaces.ICampRepository>(sp =>
                new MAM.DataAccess.Repositories.CampRepository(appSettings.ConnectionString));
            services.AddScoped<MAM.DataAccess.Interfaces.IUampRepository>(sp =>
                new MAM.DataAccess.Repositories.UampRepository(appSettings.ConnectionString));
            services.AddScoped<MAM.DataAccess.Interfaces.IStrategicAssessmentRepository>(sp =>
                new MAM.DataAccess.Repositories.StrategicAssessmentRepository(appSettings.ConnectionString));
            services.AddScoped<MAM.DataAccess.Interfaces.IAcquisitionPlanRepository>(sp =>
                new MAM.DataAccess.Repositories.AcquisitionPlanRepository(appSettings.ConnectionString));
            services.AddScoped<MAM.DataAccess.Interfaces.IOperationPlanRepository>(sp =>
                new MAM.DataAccess.Repositories.OperationPlanRepository(appSettings.ConnectionString));
            services.AddScoped<MAM.DataAccess.Interfaces.ISurrenderPlanRepository>(sp =>
                new MAM.DataAccess.Repositories.SurrenderPlanRepository(appSettings.ConnectionString));
            services.AddScoped<MAM.DataAccess.Interfaces.IMtefBudgetPeriodRepository>(sp =>
                new MAM.DataAccess.Repositories.MtefBudgetPeriodRepository(appSettings.ConnectionString));
            services.AddScoped<MAM.DataAccess.Interfaces.IProgrammeRepository>(sp =>
                new MAM.DataAccess.Repositories.ProgrammeRepository(appSettings.ConnectionString));
            services.AddScoped<MAM.DataAccess.Interfaces.IPropertyRepository>(sp =>
                new MAM.DataAccess.Repositories.PropertyRepository(appSettings.ConnectionString));
            services.AddScoped<MAM.DataAccess.Interfaces.IFacility>(sp =>
                new MAM.DataAccess.Repositories.FacilityRepository(appSettings.ConnectionString));
            services.AddScoped<MAM.DataAccess.Interfaces.IUser>(sp =>
                new MAM.DataAccess.Repositories.UserRepository(appSettings.ConnectionString));
            services.AddScoped<MAM.DataAccess.Interfaces.IOptimalSupportingAccommodationRepository>(sp =>
                new MAM.DataAccess.Repositories.OptimalSupportingAccommodationRepository(appSettings.ConnectionString));

            // Additional DataAccess registrations required by BusinessLayer repositories
            services.AddScoped<MAM.DataAccess.Interfaces.IFault>(sp =>
                new MAM.DataAccess.Repositories.FaultRepository(appSettings.ConnectionString));
            services.AddScoped<MAM.DataAccess.Interfaces.IFaultNote>(sp =>
                new MAM.DataAccess.Repositories.FaultNoteRepository(appSettings.ConnectionString));
            services.AddScoped<MAM.DataAccess.Interfaces.IHiredPropertyRepository>(sp =>
                new MAM.DataAccess.Repositories.HiredPropertyRepository(appSettings.ConnectionString));
            services.AddScoped<MAM.DataAccess.Interfaces.IProject>(sp =>
                new MAM.DataAccess.Repositories.ProjectRepository(appSettings.ConnectionString));
            services.AddScoped<MAM.DataAccess.Interfaces.IProjectSupplier>(sp =>
                new MAM.DataAccess.Repositories.ProjectSupplierRepository(appSettings.ConnectionString));
            services.AddScoped<MAM.DataAccess.Interfaces.ISupplier>(sp =>
                new MAM.DataAccess.Repositories.SupplierRepository(appSettings.ConnectionString));
            services.AddScoped<MAM.DataAccess.Interfaces.ILeaseManegement>(sp =>
                new MAM.DataAccess.Repositories.LeaseManegementRepository(appSettings.ConnectionString));
            services.AddScoped<MAM.DataAccess.Interfaces.ILandUseManagementDetailRepository>(sp =>
                new MAM.DataAccess.Repositories.LandUseManagementDetailRepository(appSettings.ConnectionString));
            services.AddScoped<MAM.DataAccess.Interfaces.ILand>(sp =>
                new MAM.DataAccess.Repositories.LandRepository(appSettings.ConnectionString));
            services.AddScoped<MAM.DataAccess.Interfaces.IConditionAssessment>(sp =>
                new MAM.DataAccess.Repositories.ConditionAssessmentRepository(appSettings.ConnectionString));

            // Business-layer repositories that adapt data-access types to business models
            services.AddScoped<MAM.BusinessLayer.Interfaces.ICampRepository>(sp =>
                new MAM.BusinessLayer.Repositories.CampRepository(sp.GetRequiredService<MAM.DataAccess.Interfaces.ICampRepository>()));
            services.AddScoped<MAM.BusinessLayer.Interfaces.IFacilityRepository>(sp =>
                new MAM.BusinessLayer.Repositories.FacilityRepository(sp.GetRequiredService<AppSettings>()));
            services.AddScoped<MAM.BusinessLayer.Interfaces.IFaultRepository>(sp =>
                new MAM.BusinessLayer.Repositories.FaultRepository(sp.GetRequiredService<AppSettings>(), sp.GetRequiredService<MAM.DataAccess.Interfaces.IFault>(), sp.GetRequiredService<MAM.DataAccess.Interfaces.IFaultNote>()));
            services.AddScoped<MAM.BusinessLayer.Interfaces.IHiringRegisterRepository>(sp =>
                new MAM.BusinessLayer.Repositories.HiringRegisterRepository(sp.GetRequiredService<AppSettings>(), sp.GetRequiredService<MAM.DataAccess.Interfaces.IHiredPropertyRepository>()));
            services.AddScoped<MAM.BusinessLayer.Interfaces.IProjectRepository>(sp =>
                new MAM.BusinessLayer.Repositories.ProjectRepository(sp.GetRequiredService<AppSettings>(), sp.GetRequiredService<MAM.DataAccess.Interfaces.IProject>(), sp.GetRequiredService<MAM.DataAccess.Interfaces.IProjectSupplier>()));
            services.AddScoped<MAM.BusinessLayer.Interfaces.ISupplierRepository>(sp =>
                new MAM.BusinessLayer.Repositories.SupplierRepository(sp.GetRequiredService<AppSettings>(), sp.GetRequiredService<MAM.DataAccess.Interfaces.ISupplier>()));
            services.AddScoped<MAM.BusinessLayer.Interfaces.ILeaseManagementRepository>(sp =>
                new MAM.BusinessLayer.Repositories.LeaseManagementRepository(sp.GetRequiredService<AppSettings>(), sp.GetRequiredService<MAM.DataAccess.Interfaces.ILeaseManegement>(), sp.GetRequiredService<MAM.DataAccess.Interfaces.ILandUseManagementDetailRepository>(), sp.GetRequiredService<MAM.DataAccess.Interfaces.ILand>()));
            services.AddScoped<MAM.BusinessLayer.Interfaces.IConditionAssessmentRepository>(sp =>
                new MAM.BusinessLayer.Repositories.ConditionAssessmentRepository(sp.GetRequiredService<AppSettings>(), sp.GetRequiredService<MAM.DataAccess.Interfaces.IConditionAssessment>()));
            services.AddScoped<MAM.BusinessLayer.Interfaces.IUserRepository>(sp =>
                (MAM.BusinessLayer.Interfaces.IUserRepository)new MAM.BusinessLayer.Repositories.UserRepository(sp.GetRequiredService<AppSettings>(), sp.GetRequiredService<MAM.DataAccess.Interfaces.IUser>()));
            services.AddScoped<MAM.BusinessLayer.Interfaces.IUserImmovableAssetManagementPlanRepository>(sp =>
                new MAM.BusinessLayer.Repositories.UserImmovableAssetManagementPlanRepository(
                    sp.GetRequiredService<AppSettings>(),
                    sp.GetRequiredService<MAM.DataAccess.Interfaces.IUampRepository>(),
                    sp.GetRequiredService<MAM.DataAccess.Interfaces.IStrategicAssessmentRepository>(),
                    sp.GetRequiredService<MAM.DataAccess.Interfaces.IAcquisitionPlanRepository>(),
                    sp.GetRequiredService<MAM.DataAccess.Interfaces.IOperationPlanRepository>(),
                    sp.GetRequiredService<MAM.DataAccess.Interfaces.ISurrenderPlanRepository>(),
                    sp.GetRequiredService<MAM.DataAccess.Interfaces.IMtefBudgetPeriodRepository>(),
                    sp.GetRequiredService<MAM.DataAccess.Interfaces.IProgrammeRepository>(),
                    sp.GetRequiredService<MAM.DataAccess.Interfaces.IPropertyRepository>(),
                    sp.GetRequiredService<MAM.DataAccess.Interfaces.IFacility>(),
                    sp.GetRequiredService<MAM.DataAccess.Interfaces.IUser>(),
                    sp.GetRequiredService<MAM.DataAccess.Interfaces.IOptimalSupportingAccommodationRepository>()));

            // File upload limits
            services.Configure<FormOptions>(options =>
            {
                options.ValueLengthLimit = int.MaxValue;
                options.MultipartBodyLengthLimit = int.MaxValue;
                options.MemoryBufferThreshold = int.MaxValue;
            });
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            // Configure logging (load log4net once at startup)
            try
            {
                // Do not attempt to configure log4net's ADO appender when running tests.
                // Tests run with environment "Test" via WebApplicationFactory.UseEnvironment("Test").
                if (!env.IsEnvironment("Test"))
                {
                    // Provide the log4net ADO appender with the application's connection string
                    // from AppSettings so log4net uses the same database as the app.
                    var settings = Configuration.GetSection("AppSettings").Get<AppSettings>() ?? new AppSettings();
                    Controllers.BaseController.SetLog4NetConfiguration(settings.ConnectionString);
                }
            }
            catch
            {
                // Swallow to avoid impacting startup; BaseController handles internal errors as well.
            }

            // Global exception handler should be first to catch exceptions from subsequent middlewares
            app.UseExceptionHandling();

            // Log incoming requests (method, path, user, small masked body)
            app.UseRequestLogging();

            app.UseRouting();
            // Expose Swagger UI early so the middleware that serves the JSON and UI
            // is not affected by the global authorization fallback policy.
            if (env.IsDevelopment() || Configuration.GetValue<bool>("Swagger:Enabled"))
            {
                app.UseSwagger();
                app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API V1");
                    c.RoutePrefix = "swagger";
                    // Enable the Authorize button in Swagger UI to add a bearer token to requests
                    c.OAuthClientId("swagger-ui");
                    c.OAuthAppName("MAM API - Swagger");
                });
            }

            // CORS
            app.UseCors("ConfiguredOrigins");

            // Auth
            app.UseAuthentication();
            app.UseAuthorization();

            // Serve static files (wwwroot and Uploads)
            app.UseStaticFiles(); // wwwroot
            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = new PhysicalFileProvider(
                    app.ApplicationServices.GetRequiredService<UploadStorage>().RootPath),
                RequestPath = "/Uploads"
            });

            // Map controllers
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }

        private static void ValidateAppSettings(AppSettings settings)
        {
            RequireSetting(settings.Secret, "AppSettings:Secret");
            if (Encoding.UTF8.GetByteCount(settings.Secret) < 32)
            {
                throw new InvalidOperationException(
                    "Configuration 'AppSettings:Secret' must contain at least 32 UTF-8 bytes.");
            }

            RequireSetting(settings.ConnectionString, "AppSettings:ConnectionString");
            RequireSetting(settings.JwtIssuer, "AppSettings:JwtIssuer");
            RequireSetting(settings.JwtAudience, "AppSettings:JwtAudience");
            // Email settings are optional for deployments that do not use SMTP.
            // If any email setting is present, require the set to be complete so email functionality works.
            var emailSet = !string.IsNullOrWhiteSpace(settings.EmailUserName)
                           || !string.IsNullOrWhiteSpace(settings.EmailHost)
                           || !string.IsNullOrWhiteSpace(settings.FromEmailAddress);

            if (emailSet)
            {
                RequireSetting(settings.EmailUserName, "AppSettings:EmailUserName");
                RequireSetting(settings.EmailPassword, "AppSettings:EmailPassword");
                RequireSetting(settings.EmailHost, "AppSettings:EmailHost");
                RequireSetting(settings.FromEmailAddress, "AppSettings:FromEmailAddress");

                if (settings.EmailPot <= 0)
                {
                    throw new InvalidOperationException("Configuration 'AppSettings:EmailPot' must be greater than zero when email is enabled.");
                }
            }

            RequireSetting(settings.WebAppURL, "AppSettings:WebAppURL");
            RequireSetting(settings.UploadsFolder, "AppSettings:UploadsFolder");

            // JwtIssuer and JwtAudience may be simple identifiers (not necessarily absolute URLs).
            RequireSetting(settings.JwtIssuer, "AppSettings:JwtIssuer");
            RequireSetting(settings.JwtAudience, "AppSettings:JwtAudience");

            // WebAppURL must be an absolute URL
            ValidateAbsoluteUri(settings.WebAppURL, "AppSettings:WebAppURL");

            foreach (var origin in settings.AllowedOrigins ?? Array.Empty<string>())
            {
                if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri) ||
                    (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps) ||
                    uri.GetLeftPart(UriPartial.Authority) != origin.TrimEnd('/'))
                {
                    throw new InvalidOperationException(
                        $"Configuration 'AppSettings:AllowedOrigins' contains an invalid origin: '{origin}'.");
                }
            }
        }

        private static void RequireSetting(string value, string settingName)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                throw new InvalidOperationException(
                    $"Required configuration '{settingName}' is missing. Set it in appsettings or the deployment environment.");
            }
        }

        private static void ValidateAbsoluteUri(string value, string settingName)
        {
            if (!Uri.TryCreate(value, UriKind.Absolute, out _))
            {
                throw new InvalidOperationException(
                    $"Configuration '{settingName}' must be an absolute URL.");
            }
        }
    }
}
