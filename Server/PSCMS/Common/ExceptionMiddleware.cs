using System.Net;
using System.Text.Json;

namespace PSCMS.Common;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext ctx)
    {
        try
        {
            await _next(ctx);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception for {Method} {Path}", ctx.Request.Method, ctx.Request.Path);
            await WriteErrorResponseAsync(ctx, ex);
        }
    }

    private static async Task WriteErrorResponseAsync(HttpContext ctx, Exception ex)
    {
        ctx.Response.ContentType = "application/json";

        (int statusCode, string message) = ex switch
        {
            InvalidOperationException => ((int)HttpStatusCode.BadRequest, ex.Message),
            UnauthorizedAccessException => ((int)HttpStatusCode.Forbidden, "Access denied."),
            KeyNotFoundException => ((int)HttpStatusCode.NotFound, ex.Message),
            _ => ((int)HttpStatusCode.InternalServerError, "An unexpected error occurred. Please try again later.")
        };

        ctx.Response.StatusCode = statusCode;

        var body = JsonSerializer.Serialize(new
        {
            success = false,
            message,
            statusCode
        }, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

        await ctx.Response.WriteAsync(body);
    }
}
