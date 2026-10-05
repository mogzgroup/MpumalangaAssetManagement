using System;
using System.Net;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
using log4net;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;

namespace MAM.API
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IWebHostEnvironment _env;
        private static readonly ILog Log = LogManager.GetLogger(typeof(ExceptionHandlingMiddleware));

        public ExceptionHandlingMiddleware(RequestDelegate next, IWebHostEnvironment env)
        {
            _next = next;
            _env = env;
        }

        public async Task Invoke(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                try
                {
                    var correlationId = context.Items.ContainsKey(MAM.API.Middleware.CorrelationIdMiddleware.CorrelationIdHeader)
                        ? context.Items[MAM.API.Middleware.CorrelationIdMiddleware.CorrelationIdHeader]?.ToString()
                        : null;

                    var msg = $"Unhandled exception processing request {context.Request.Method} {context.Request.Path}";
                    if (!string.IsNullOrEmpty(correlationId))
                        msg = $"[{correlationId}] " + msg;

                    Log.Error(msg, ex);
                }
                catch
                {
                    // ignore logging errors
                }

                if (!context.Response.HasStarted)
                {
                    context.Response.Clear();

                    // In the Test environment replace the Response Body with a MemoryStream so
                    // formatters serialize to a stream instead of a PipeWriter. This avoids
                    // an incompatibility when the test host ResponseBodyPipeWriter does not
                    // implement certain newer PipeWriter members used by System.Text.Json.
                    Stream originalBody = context.Response.Body;
                    MemoryStream testBody = null;
                    if (_env != null && _env.EnvironmentName == "Test")
                    {
                        testBody = new MemoryStream();
                        context.Response.Body = testBody;
                    }

                    // If this is a validation error, return 400 with safe message
                    if (ex is MAM.BusinessLayer.Helpers.ValidationException vex)
                    {
                        context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                        context.Response.ContentType = "application/json";
                        var correlationId2 = context.Items.ContainsKey(MAM.API.Middleware.CorrelationIdMiddleware.CorrelationIdHeader)
                            ? context.Items[MAM.API.Middleware.CorrelationIdMiddleware.CorrelationIdHeader]?.ToString()
                            : null;

                        var payload400 = JsonSerializer.Serialize(new
                        {
                            success = false,
                            message = vex.Message,
                            correlationId = correlationId2
                        });
                        await context.Response.WriteAsync(payload400);
                        return;
                    }

                    context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    context.Response.ContentType = "application/json";
                    var correlationId = context.Items.ContainsKey(MAM.API.Middleware.CorrelationIdMiddleware.CorrelationIdHeader)
                        ? context.Items[MAM.API.Middleware.CorrelationIdMiddleware.CorrelationIdHeader]?.ToString()
                        : null;

                    object payload;
                    if (_env != null && _env.EnvironmentName == "Test")
                    {
                        // In test environment include exception details to aid debugging
                        payload = new
                        {
                            error = ex.Message,
                            detail = ex.ToString(),
                            correlationId = correlationId
                        };
                    }
                    else
                    {
                        payload = new
                        {
                            error = "An unexpected error occurred.",
                            correlationId = correlationId
                        };
                    }

                    var payloadJson = JsonSerializer.Serialize(payload);
                    await context.Response.WriteAsync(payloadJson);

                    // If we swapped the response body for testing, copy the written bytes to the original stream
                    if (testBody != null)
                    {
                        try
                        {
                            testBody.Position = 0;
                            await testBody.CopyToAsync(originalBody);
                            await originalBody.FlushAsync();
                        }
                        finally
                        {
                            // restore original body so downstream consumers behave normally
                            context.Response.Body = originalBody;
                            testBody.Dispose();
                        }
                    }
                }
            }
        }
    }

    public static class ExceptionHandlingMiddlewareExtensions
    {
        public static IApplicationBuilder UseExceptionHandling(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<ExceptionHandlingMiddleware>();
        }
    }
}
