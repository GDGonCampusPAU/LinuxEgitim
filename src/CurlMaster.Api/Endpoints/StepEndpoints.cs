using CurlMaster.Api.Models;
using CurlMaster.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace CurlMaster.Api.Endpoints;

public static class StepEndpoints
{
    public static IEndpointRouteBuilder MapStepEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/", () => Results.Text(
            """
            Kadim ağ seni bekliyor.

            İlk adım /uyanis ile başlar.
            """
        ));

        app.MapGet("/uyanis", () => Results.Text(
            """
            Her gerçek mesaj gövdede yazmaz.

            Bazı kapılar yalnızca sessizliği dinler.
            """
        ));

        app.MapMethods("/kapi", ["GET", "HEAD"], (HttpResponse response) =>
        {
            response.Headers["X-Yol"] = "/arsiv";

            return Results.Text(
                """
                Kapı konuşmuyor.

                Belki de cevap görünmeyen yerdedir.
                """
            );
        });

        app.MapGet("/arsiv", (IWebHostEnvironment env) =>
        {
            var path = Path.Combine(env.WebRootPath, "arsiv.txt");

            if (!File.Exists(path))
            {
                return Results.NotFound(
                    """
                    Arşiv boş görünüyor.

                    Kayıp parça henüz yerleştirilmemiş olabilir.
                    """
                );
            }

            return Results.File(path, "text/plain", "arsiv.txt");
        });

        app.MapGet("/kasa/kalinti.zip", (IWebHostEnvironment env) =>
        {
            var path = Path.Combine(env.WebRootPath, "kalinti.zip");

            if (!File.Exists(path))
            {
                return Results.NotFound(
                    """
                    Kasa açılmış ama içeride hiçbir şey yok.
                    """
                );
            }

            return Results.File(path, "application/zip", "kalinti.zip");
        });

        app.MapPost("/sunak", async (
            [FromForm] FinishRequest payload,
            IConfiguration config,
            IScoreboardService scoreboard) =>
        {
            var expected = config["Game:AccessCode"];

            if (!string.Equals(payload.Code?.Trim(), expected, StringComparison.OrdinalIgnoreCase))
            {
                return Results.BadRequest(
                    """
                    Sunak sunduğun kodu reddetti.

                    Kalıntıyı tekrar incele.
                    """
                );
            }

            if (string.IsNullOrWhiteSpace(payload.Name))
            {
                return Results.BadRequest(
                    """
                    İsimsiz yolcular kabul edilmiyor.
                    """
                );
            }

            var (entry, isNew) = await scoreboard.RegisterAsync(payload.Name.Trim());

            if (!isNew)
            {
                return Results.Conflict(
                    $"""
                    Bu isim zaten sıralamada (#{entry.Rank}).

                    Farklı bir isim dene.
                    """
                );
            }

            return Results.Text(
                $"""
                Kabul edildin {entry.Name}.

                Sıran: #{entry.Rank}
                """
            );
        })
        .DisableAntiforgery()
        .RequireRateLimiting("finish");

        app.MapGet("/skor", async (IScoreboardService scoreboard) =>
        {
            var entries = await scoreboard.GetAllAsync();
            return Results.Ok(entries);
        });

        app.MapGet("/oyun/durum", async (IScoreboardService scoreboard) =>
        {
            var entries = await scoreboard.GetAllAsync();

            return Results.Ok(new
            {
                durum = "aktif",
                toplamYolcu = entries.Count,
                ilkUc = entries.Take(3).ToList(),
            });
        });

        app.MapGet("/saglik", () => Results.Ok(new
        {
            durum = "ok"
        }));

        return app;
    }
}