using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;

namespace MAM.API.Middleware
{
    public class CorrelationIdMiddleware
    {
        private readonly RequestDelegate _next;
        public const string CorrelationIdHeader = "X-Correlation-ID";

        public CorrelationIdMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context)
        {
            // If caller provided a correlation id, use it; otherwise generate a new one.
            string correlationId = context.Request.Headers[CorrelationIdHeader];
            if (string.IsNullOrWhiteSpace(correlationId))
            {
                correlationId = Guid.NewGuid().ToString("N");
            }

            // Make available to other middleware / logging
            context.Items[CorrelationIdHeader] = correlationId;

            // Add to response header for client correlation
            if (!context.Response.HasStarted)
                context.Response.OnStarting(() => {
                    context.Response.Headers[CorrelationIdHeader] = correlationId;
                    return Task.CompletedTask;
                });

            await _next(context);
        }
    }

    public static class CorrelationIdMiddlewareExtensions
    {
        public static IApplicationBuilder UseCorrelationId(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<CorrelationIdMiddleware>();
        }
    }
}
