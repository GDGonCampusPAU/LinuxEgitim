namespace CurlMaster.Api.Endpoints;

public sealed class AdminAuthFilter : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        var config = context.HttpContext.RequestServices.GetRequiredService<IConfiguration>();
        var expected = config["Admin:ApiKey"];

        if (string.IsNullOrWhiteSpace(expected))
            return Results.Problem("Admin API key not configured.", statusCode: 500);

        var header = context.HttpContext.Request.Headers.Authorization.ToString();
        var presented = header.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase)
            ? header["Bearer ".Length..].Trim()
            : null;

        if (!string.Equals(presented, expected, StringComparison.Ordinal))
            return Results.Unauthorized();

        return await next(context);
    }
}
