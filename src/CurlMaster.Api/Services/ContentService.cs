using System.Text;
using ICSharpCode.SharpZipLib.Zip;

namespace CurlMaster.Api.Services;

public sealed class ContentService : IContentService
{
    private readonly IWebHostEnvironment _env;
    private readonly IConfiguration _config;
    private readonly ILogger<ContentService> _logger;
    private readonly SemaphoreSlim _lock = new(1, 1);

    public ContentService(IWebHostEnvironment env, IConfiguration config, ILogger<ContentService> logger)
    {
        _env = env;
        _config = config;
        _logger = logger;
    }

    public Task EnsureAsync(CancellationToken ct = default) => GenerateAsync(force: false, ct);

    public Task RegenerateAsync(CancellationToken ct = default) => GenerateAsync(force: true, ct);

    private async Task GenerateAsync(bool force, CancellationToken ct)
    {
        await _lock.WaitAsync(ct);
        try
        {
            var wwwroot = _env.WebRootPath;
            Directory.CreateDirectory(wwwroot);

            var accessCode = _config["Game:AccessCode"] ?? throw new InvalidOperationException("Game:AccessCode missing");
            var archivePassword = _config["Game:ArchivePassword"] ?? throw new InvalidOperationException("Game:ArchivePassword missing");

            var utf8NoBom = new UTF8Encoding(false);

            var arsivPath = Path.Combine(wwwroot, "arsiv.txt");
            if (force || !File.Exists(arsivPath))
            {
                await File.WriteAllTextAsync(arsivPath, BuildArsiv(), utf8NoBom, ct);
                _logger.LogInformation("Wrote {File}", arsivPath);
            }

            var zipPath = Path.Combine(wwwroot, "kalinti.zip");
            if (force || !File.Exists(zipPath))
            {
                var entries = new (string name, byte[] data)[]
                {
                    ("sistem.txt", utf8NoBom.GetBytes(BuildSistem(accessCode))),
                    ("veriler.txt", utf8NoBom.GetBytes(BuildVeriler())),
                    ("beni_oku.txt", utf8NoBom.GetBytes(BuildBeniOku())),
                };

                PackPasswordZip(zipPath, archivePassword, entries);
                _logger.LogInformation("Wrote {File} ({Size} bytes)", zipPath, new FileInfo(zipPath).Length);
            }
        }
        finally
        {
            _lock.Release();
        }
    }

    private static string BuildArsiv() =>
        """
        Kayıp kalıntı arşivde saklanıyor.

        Yol:
        /kasa/kalinti.zip

        Kasayı GDG ve Siberay açar.
        """;

    private static string BuildSistem(string accessCode) =>
        $"""
        [INFO] sistem başlatıldı
        [DEBUG] bağlantı kuruldu
        [WARN] eski anahtar bulundu
        [INFO] hedef=/sunak
        [ERROR] kod=YANLIS-1453
        [INFO] kod={accessCode}
        [TRACE] işlem tamamlandı

        "name=ADINIZ_SOYADINIZ&code=GİZLİ_KOD" isteğin içerisi bu sekilde olmasi gerekiyor
        """;

    private static string BuildVeriler() =>
        """
        debug=false
        temp=123
        cache=enabled
        nothing=here
        """;

    private static string BuildBeniOku() =>
        """
        Gerçek cevap genellikle gürültünün içinde saklanır.

        Kayıtları dikkatlice incele.
        """;

    private static void PackPasswordZip(string zipPath, string password, IReadOnlyList<(string name, byte[] data)> entries)
    {
        using var output = File.Create(zipPath);
        using var zip = new ZipOutputStream(output);
        zip.Password = password;
        zip.SetLevel(6);

        foreach (var (name, data) in entries)
        {
            var entry = new ZipEntry(name)
            {
                DateTime = DateTime.UtcNow,
                Size = data.Length,
            };
            zip.PutNextEntry(entry);
            zip.Write(data, 0, data.Length);
            zip.CloseEntry();
        }

        zip.Finish();
    }
}
