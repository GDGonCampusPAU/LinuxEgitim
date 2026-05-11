namespace CurlMaster.Api.Services;

public interface IContentService
{
    Task EnsureAsync(CancellationToken ct = default);
    Task RegenerateAsync(CancellationToken ct = default);
}
