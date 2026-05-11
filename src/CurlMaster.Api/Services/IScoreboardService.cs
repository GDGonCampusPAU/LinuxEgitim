using CurlMaster.Api.Models;

namespace CurlMaster.Api.Services;

public interface IScoreboardService
{
    Task<ScoreEntry> RegisterAsync(string name, CancellationToken ct = default);
    Task<IReadOnlyList<ScoreEntry>> GetAllAsync(CancellationToken ct = default);
    Task ClearAsync(CancellationToken ct = default);
}
