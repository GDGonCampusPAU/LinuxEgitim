using CurlMaster.Api.Models;
using CurlMaster.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace CurlMaster.Api.Endpoints;

public static class StepEndpoints
{
    public static IEndpointRouteBuilder MapStepEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/", () => Results.Text(
            "Curl Master API. Macerayı başlatmak için: curl http://api.col/start"));

        app.MapGet("/start", () => Results.Redirect("/step/01-welcome", permanent: false));

        app.MapGet("/step/01-welcome", () => Results.Text(
            "Hoş geldin! Bir sonraki adım için başlıkları (headers) kontrol et.\nİpucu: curl -I http://api.col/step/02-headers"));

        app.MapMethods("/step/02-headers", ["GET", "HEAD"], (HttpResponse response) =>
        {
            response.Headers["X-Next-Step"] = "/step/03-download";
            return Results.Text("Burada görülecek bir şey yok, sadece başlıklara bak.");
        });

        app.MapGet("/step/03-download", (IWebHostEnvironment env) =>
        {
            var path = Path.Combine(env.WebRootPath, "ipucu.txt");
            if (!File.Exists(path)) return Results.NotFound("ipucu.txt henüz hazırlanmadı.");
            return Results.File(path, "text/plain", "ipucu.txt");
        });

        app.MapGet("/step/05-archive/mission.zip", (IWebHostEnvironment env) =>
        {
            var path = Path.Combine(env.WebRootPath, "mission.zip");
            if (!File.Exists(path)) return Results.NotFound("mission.zip henüz hazırlanmadı.");
            return Results.File(path, "application/zip", "mission.zip");
        });

        app.MapGet("/step/07-secure", (HttpRequest request) =>
        {
            if (!request.IsHttps)
                return Results.BadRequest("Bu endpoint sadece HTTPS üzerinden erişilebilir. -k parametresini dene.");
            return Results.Text("Güvenli bölgeye ulaştın. Final için verilerini /finish adresine POST et.\nÖrnek: curl -X POST -d \"name=ADIN&code=KOD\" http://api.col/finish");
        });

        app.MapPost("/finish", async (
            [FromForm] FinishRequest payload,
            IConfiguration config,
            IScoreboardService scoreboard) =>
        {
            var expected = config["Game:AccessCode"];
            if (!string.Equals(payload.Code, expected, StringComparison.Ordinal))
                return Results.BadRequest("Hatalı kod. list.txt'i tekrar incele.");

            if (string.IsNullOrWhiteSpace(payload.Name))
                return Results.BadRequest("name boş olamaz.");

            var entry = await scoreboard.RegisterAsync(payload.Name.Trim());
            return Results.Text($"Tebrikler {entry.Name}! Kaydın başarıyla alındı. Sıralama: #{entry.Rank}");
        }).DisableAntiforgery().RequireRateLimiting("finish");

        app.MapGet("/scoreboard", async (IScoreboardService scoreboard) =>
        {
            var entries = await scoreboard.GetAllAsync();
            return Results.Ok(entries);
        });

        app.MapGet("/game/info", async (IScoreboardService scoreboard) =>
        {
            var entries = await scoreboard.GetAllAsync();
            return Results.Ok(new
            {
                status = "active",
                totalParticipants = entries.Count,
                topThree = entries.Take(3).ToList(),
            });
        });

        app.MapGet("/healthz", () => Results.Ok(new { status = "ok" }));

        return app;
    }
}
