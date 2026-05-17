using System.Text.Json;
using CurlMaster.Api.Models;

namespace CurlMaster.Api.Services;

public sealed class ScoreboardService : IScoreboardService
{
    private readonly string _path;
    private readonly SemaphoreSlim _lock = new(1, 1);
    private readonly ILogger<ScoreboardService> _logger;

    public ScoreboardService(IConfiguration config, ILogger<ScoreboardService> logger)
    {
        _path = config["Game:ScoreboardPath"] ?? "data/scoreboard.json";
        _logger = logger;

        var dir = Path.GetDirectoryName(_path);
        if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir))
            Directory.CreateDirectory(dir);
    }

    public async Task<ScoreEntry> RegisterAsync(string name, CancellationToken ct = default)
    {
        await _lock.WaitAsync(ct);
        try
        {
            var entries = await LoadAsync(ct);

            var existing = entries.FirstOrDefault(e =>
                string.Equals(e.Name, name, StringComparison.OrdinalIgnoreCase));
            if (existing is not null)
            {
                _logger.LogInformation("Duplicate finish for {Name}, returning existing rank {Rank}", name, existing.Rank);
                return existing;
            }

            var entry = new ScoreEntry(
                Name: name,
                TimestampMs: DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                Rank: entries.Count + 1);

            entries.Add(entry);
            await SaveAsync(entries, ct);
            _logger.LogInformation("Registered finisher {Name} at rank {Rank}", name, entry.Rank);
            return entry;
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task<IReadOnlyList<ScoreEntry>> GetAllAsync(CancellationToken ct = default)
    {
        await _lock.WaitAsync(ct);
        try
        {
            return await LoadAsync(ct);
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task ClearAsync(CancellationToken ct = default)
    {
        await _lock.WaitAsync(ct);
        try
        {
            if (File.Exists(_path)) File.Delete(_path);
            _logger.LogWarning("Scoreboard cleared");
        }
        finally
        {
            _lock.Release();
        }
    }

    private async Task<List<ScoreEntry>> LoadAsync(CancellationToken ct)
    {
        if (!File.Exists(_path)) return [];
        await using var stream = File.OpenRead(_path);
        var data = await JsonSerializer.DeserializeAsync<List<ScoreEntry>>(stream, cancellationToken: ct);
        return data ?? [];
    }

    private async Task SaveAsync(List<ScoreEntry> entries, CancellationToken ct)
    {
        await using var stream = File.Create(_path);
        await JsonSerializer.SerializeAsync(stream, entries, new JsonSerializerOptions { WriteIndented = true }, ct);
    }
}
