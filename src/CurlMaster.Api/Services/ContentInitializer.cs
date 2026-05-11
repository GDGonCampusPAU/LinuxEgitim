namespace CurlMaster.Api.Services;

public sealed class ContentInitializer : IHostedService
{
    private readonly IContentService _content;

    public ContentInitializer(IContentService content) => _content = content;

    public Task StartAsync(CancellationToken cancellationToken) => _content.EnsureAsync(cancellationToken);

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
