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

            var ipucuPath = Path.Combine(wwwroot, "ipucu.txt");
            if (force || !File.Exists(ipucuPath))
            {
                await File.WriteAllTextAsync(ipucuPath, BuildIpucuText(), utf8NoBom, ct);
                _logger.LogInformation("Wrote {File}", ipucuPath);
            }

            var listPath = Path.Combine(wwwroot, "list.txt");
            var zipPath = Path.Combine(wwwroot, "mission.zip");

            if (force || !File.Exists(zipPath))
            {
                var listBytes = utf8NoBom.GetBytes(BuildListText(accessCode));
                await File.WriteAllBytesAsync(listPath, listBytes, ct);
                PackPasswordZip(zipPath, archivePassword, "list.txt", listBytes);
                _logger.LogInformation("Wrote {File} ({Size} bytes)", zipPath, new FileInfo(zipPath).Length);
            }
        }
        finally
        {
            _lock.Release();
        }
    }

    private static string BuildIpucuText() =>
        """
        Tebrikler! İlk engeli aştın.

        Bir sonraki ipucu kilitli bir arşivin içinde.
        Arşivi indir:
          curl -O http://api.col/step/05-archive/mission.zip

        Parola İpucu:
          Linux'ta temel bir felsefe vardır: "Linux'ta her şey bir dosyadır."
          Bu cümlenin İNGİLİZCESİNİ küçük harflerle yaz, boşluk yerine alt çizgi (_) koy.

        Arşivi açtıktan sonra list.txt içinde ACCESS kelimesini grep ile ara.
        """;

    private static string BuildListText(string accessCode)
    {
        var rng = new Random(42);
        var lines = new List<string>(1000);
        var accessLineIndex = rng.Next(250, 850);

        for (var i = 0; i < 1000; i++)
        {
            lines.Add(i == accessLineIndex
                ? $"ACCESS_CODE: {accessCode}"
                : GenerateNoiseLine(rng, i));
        }

        return string.Join('\n', lines);
    }

    private static string GenerateNoiseLine(Random rng, int index)
    {
        var templates = new[]
        {
            "[INFO] kernel: TCP connection established from 10.{0}.{1}.{2}",
            "[DEBUG] systemd[1]: Starting {3}.service",
            "ext4-fs (sda{4}): mounted filesystem with ordered data mode",
            "wpa_supplicant: CTRL-EVENT-CONNECTED to {5}",
            "audit: type=1400 audit({6}): apparmor=\"ALLOWED\"",
            "loaded module: {7} (verified)",
            "[WARN] dhclient: lease offered: 192.168.{0}.{1}",
            "snd_hda_intel: codec stream {4} initialized",
            "usb {4}-{8}: new high-speed USB device number {8} using xhci_hcd",
            "Bluetooth: hci{4}: link key request received",
        };

        var services = new[] { "nginx", "redis", "docker", "containerd", "sshd", "cron", "cups", "rsyslog" };
        var modules = new[] { "brcmfmac", "nvidia_drm", "i915", "btusb", "snd_usb_audio", "uvcvideo", "kvm_intel" };
        var ssids = new[] { "GDGonCampusPAU_5G", "EduRoam", "Office-WiFi", "Guest-Network", "ctf-arena" };

        var template = templates[rng.Next(templates.Length)];
        return string.Format(template,
            rng.Next(0, 255),
            rng.Next(0, 255),
            rng.Next(0, 255),
            services[rng.Next(services.Length)],
            rng.Next(0, 9),
            ssids[rng.Next(ssids.Length)],
            (1700000000 + index * 1000).ToString(),
            modules[rng.Next(modules.Length)],
            rng.Next(1, 32));
    }

    private static void PackPasswordZip(string zipPath, string password, string entryName, byte[] entryContent)
    {
        using var output = File.Create(zipPath);
        using var zip = new ZipOutputStream(output);
        zip.Password = password;
        zip.SetLevel(6);

        var entry = new ZipEntry(entryName)
        {
            DateTime = DateTime.UtcNow,
            Size = entryContent.Length,
        };
        zip.PutNextEntry(entry);
        zip.Write(entryContent, 0, entryContent.Length);
        zip.CloseEntry();
        zip.Finish();
    }
}
