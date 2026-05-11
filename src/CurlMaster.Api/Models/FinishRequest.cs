namespace CurlMaster.Api.Models;

public sealed record FinishRequest(string Name, string Code);

public sealed record ScoreEntry(string Name, long TimestampMs, int Rank);
