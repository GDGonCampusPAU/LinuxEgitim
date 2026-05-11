using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;

namespace CurlMaster.Api.Services;

public static class CertificateGenerator
{
    public static void EnsureSelfSigned(string pfxPath, string password, string subject = "CN=api.col")
    {
        if (File.Exists(pfxPath)) return;

        var directory = Path.GetDirectoryName(pfxPath);
        if (!string.IsNullOrEmpty(directory)) Directory.CreateDirectory(directory);

        using var rsa = RSA.Create(2048);
        var request = new CertificateRequest(subject, rsa, HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1);

        var sanBuilder = new SubjectAlternativeNameBuilder();
        sanBuilder.AddDnsName("api.col");
        sanBuilder.AddDnsName("localhost");
        request.CertificateExtensions.Add(sanBuilder.Build());

        using var certificate = request.CreateSelfSigned(
            DateTimeOffset.UtcNow.AddDays(-1),
            DateTimeOffset.UtcNow.AddYears(2));

        var bytes = certificate.Export(X509ContentType.Pfx, password);
        File.WriteAllBytes(pfxPath, bytes);
    }
}
