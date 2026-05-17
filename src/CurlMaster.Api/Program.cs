using System.Threading.RateLimiting;
using CurlMaster.Api.Endpoints;
using CurlMaster.Api.Services;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

var httpPort = builder.Configuration.GetValue("Game:HttpPort", 8080);
var httpsPort = builder.Configuration.GetValue("Game:HttpsPort", 8443);
var certPath = builder.Configuration["Game:HttpsCertPath"] ?? "certs/dev-cert.pfx";
var certPassword = builder.Configuration["Game:HttpsCertPassword"] ?? "curlmaster";

CertificateGenerator.EnsureSelfSigned(certPath, certPassword);

builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(httpPort);
    options.ListenAnyIP(httpsPort, listen => listen.UseHttps(certPath, certPassword));
});

var knownProxies = builder.Configuration.GetSection("ForwardedHeaders:KnownProxies").Get<string[]>() ?? [];
var knownNetworks = builder.Configuration.GetSection("ForwardedHeaders:KnownNetworks").Get<string[]>() ?? [];

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
    options.ForwardLimit = null;

    foreach (var proxy in knownProxies)
    {
        if (System.Net.IPAddress.TryParse(proxy, out var ip))
            options.KnownProxies.Add(ip);
    }

    foreach (var network in knownNetworks)
    {
        if (System.Net.IPNetwork.TryParse(network, out var parsed))
            options.KnownIPNetworks.Add(parsed);
    }
});

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        if (allowedOrigins.Length == 0)
            policy.AllowAnyOrigin();
        else
            policy.WithOrigins(allowedOrigins);

        policy
            .AllowAnyMethod()
            .AllowAnyHeader()
            .WithExposedHeaders("X-Next-Step");
    });
});

var finishPermits = builder.Configuration.GetValue("RateLimit:FinishPermitsPerMinute", 5);

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("finish", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = finishPermits,
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0,
            }));
});

builder.Services.AddSingleton<IScoreboardService, ScoreboardService>();
builder.Services.AddSingleton<IContentService, ContentService>();
builder.Services.AddScoped<AdminAuthFilter>();
builder.Services.AddHostedService<ContentInitializer>();

var app = builder.Build();

var adminKey = app.Configuration["Admin:ApiKey"];
if (app.Environment.IsProduction() &&
    (string.IsNullOrWhiteSpace(adminKey) || adminKey == "change-me-in-production"))
{
    throw new InvalidOperationException(
        "Admin:ApiKey must be set via ADMIN_API_KEY environment variable in production.");
}

app.UseForwardedHeaders();
app.UseCors();
app.UseRateLimiter();
app.UseStaticFiles();

app.MapStepEndpoints();
app.MapAdminEndpoints();

app.Run();
