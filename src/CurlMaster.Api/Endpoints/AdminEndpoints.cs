using CurlMaster.Api.Services;

namespace CurlMaster.Api.Endpoints;

public static class AdminEndpoints
{
    public static IEndpointRouteBuilder MapAdminEndpoints(this IEndpointRouteBuilder app)
    {
        var admin = app.MapGroup("/admin").AddEndpointFilter<AdminAuthFilter>();

        admin.MapGet("/state", async (
            IScoreboardService scoreboard,
            IConfiguration config) =>
        {
            var entries = await scoreboard.GetAllAsync();
            return Results.Ok(new
            {
                participantCount = entries.Count,
                accessCode = config["Game:AccessCode"],
                archivePassword = config["Game:ArchivePassword"],
                scoreboard = entries,
            });
        });

        admin.MapDelete("/scoreboard", async (IScoreboardService scoreboard) =>
        {
            await scoreboard.ClearAsync();
            return Results.Ok(new { cleared = true });
        });

        admin.MapPost("/regenerate-content", async (IContentService content) =>
        {
            await content.RegenerateAsync();
            return Results.Ok(new { regenerated = true });
        });

        return app;
    }
}
