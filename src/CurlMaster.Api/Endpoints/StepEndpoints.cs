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
            var path = Path.Combine(env.WebRootPath, "parca.txt");

            if (!File.Exists(path))
            {
                return Results.NotFound(
                    """
                    Arşiv boş görünüyor.

                    Kayıp parça henüz yerleştirilmemiş olabilir.
                    """
                );
            }

            return Results.File(path, "text/plain", "parca.txt");
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

        app.MapGet("/mabed", (HttpRequest request) =>
        {
            if (!request.IsHttps)
            {
                return Results.BadRequest(
                    """
                    Mabed güvensiz yolcuları kabul etmiyor.

                    Güvenli bir bağlantı kurmayı dene.
                    """
                );
            }

            return Results.Text(
                """
                Mabed seni kabul etti.

                Son adımda sunağa adını ve bulduğun kodu sunmalısın.
                """
            );
        });

        app.MapPost("/sunak", async (
            [FromForm] FinishRequest payload,
            IConfiguration config,
            IScoreboardService scoreboard) =>
        {
            var expected = config["Game:AccessCode"];

            if (!string.Equals(payload.Code, expected, StringComparison.Ordinal))
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

            var entry = await scoreboard.RegisterAsync(payload.Name.Trim());

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