# Linux Treasure Hunt: The Curl Master

GDG on Campus PAU için Linux/terminal eğitim oyunu backend'i. Katılımcılar yalnızca `curl` komutu kullanarak 8 adımlı bir hazine avını çözer.

## Mimari

- **.NET 10** ASP.NET Core Minimal API
- **Kestrel** çift listener: HTTP (oyun akışı) + HTTPS (sahte sertifika ile 7. adım)
- **JSON dosya** tabanlı skorbord (Docker volume ile kalıcı)
- **SharpZipLib** ile parola korumalı arşiv üretimi
- **Docker** ile tek komutta deploy

## Oyun Akışı

| Adım | Endpoint | Davranış |
|------|----------|----------|
| 1 | `GET /start` | `/step/01-welcome` adresine 302 yönlendirme |
| 2 | `GET /step/01-welcome` | Hoş geldin metni |
| 3 | `GET /step/02-headers` | `X-Next-Step` header'ı ile bir sonraki adım |
| 4 | `GET /step/03-download` | `ipucu.txt` indirme |
| 5 | `GET /step/05-archive/mission.zip` | Parola korumalı zip |
| 6 | `GET /step/07-secure` | Geçersiz sertifikalı HTTPS endpoint'i |
| 7 | `POST /finish` | Form-data: `name`, `code` — skorboarda yazar (rate-limited) |

### Public ek endpoint'ler

| Endpoint | Açıklama |
|----------|----------|
| `GET /game/info` | Frontend için özet: status, toplam katılımcı, top 3 |
| `GET /scoreboard` | Tüm kazananların JSON listesi |
| `GET /healthz` | Sağlık kontrolü |

### Admin endpoint'leri

Tüm admin endpoint'leri `Authorization: Bearer <ADMIN_API_KEY>` header'ı gerektirir.

| Endpoint | Açıklama |
|----------|----------|
| `GET /admin/state` | Tüm yapılandırma + skorbord |
| `DELETE /admin/scoreboard` | Skorbordu sıfırla |
| `POST /admin/regenerate-content` | `wwwroot/` içeriğini yeniden üret (config değişiminden sonra) |

## Geliştirme

Gereksinim: .NET 10 SDK.

```bash
cd src/CurlMaster.Api
dotnet run
```

İlk çalıştırmada şu dosyalar otomatik üretilir (varsa atlanır):
- `certs/dev-cert.pfx` — self-signed sertifika
- `wwwroot/ipucu.txt` — 3. adımda servis edilecek ipucu metni
- `wwwroot/list.txt` — 1000 satır, içine ACCESS_CODE gömülü
- `wwwroot/mission.zip` — parola korumalı arşiv (list.txt içerir)

Servis dinler: `http://localhost:8080` ve `https://localhost:8443`.

### Hızlı test

```bash
curl -L http://localhost:8080/start
curl -I http://localhost:8080/step/02-headers
curl -o ipucu.txt http://localhost:8080/step/03-download
curl -O http://localhost:8080/step/05-archive/mission.zip
unzip -P everything_is_a_file mission.zip
grep ACCESS list.txt
curl -k https://localhost:8443/step/07-secure
curl -X POST -d "name=Furkan&code=linux_kernel_2026" http://localhost:8080/finish
curl http://localhost:8080/scoreboard
```

## Deploy (Docker)

```bash
cp .env.example .env
# .env içindeki kodları/parolaları düzenle (opsiyonel)
docker compose up -d --build
```

Servis varsayılan olarak host'un 80 ve 443 portlarına bağlanır. Ortam değişkenleriyle override edilebilir:

| Değişken | Varsayılan | Açıklama |
|----------|------------|----------|
| `HTTP_PORT` | `80` | Host HTTP portu |
| `HTTPS_PORT` | `443` | Host HTTPS portu (geçersiz cert ile) |
| `ACCESS_CODE` | `linux_kernel_2026` | POST /finish doğrulama kodu |
| `ARCHIVE_PASSWORD` | `everything_is_a_file` | mission.zip parolası |
| `CERT_PASSWORD` | `curlmaster` | PFX dosya parolası |
| `ADMIN_API_KEY` | `change-me-in-production` | `/admin/*` endpoint'leri için Bearer token |
| `CORS_ALLOWED_ORIGINS` | (boş = hepsi) | Frontend origin'i, ör: `https://app.example.com` |

Persist edilen volume'lar:
- `./data` — `scoreboard.json` (kazananlar listesi)
- `./certs` — `dev-cert.pfx` (yeniden başlatmalar arası aynı cert)

`wwwroot/` içeriği container'da kalır; **`ACCESS_CODE` değiştirip restart yapmak istersen** container'ı yeni `.env` ile yeniden build et: `docker compose up -d --build --force-recreate`.

### Sağlık kontrolü

```bash
curl http://<host>/healthz
docker compose ps          # healthcheck durumunu gösterir
```

### Logları izle

```bash
docker compose logs -f curlmaster
```

## DNS / Domain Notu

PDF'lerdeki `api.col` örnek bir domain. Gerçek deploy için kendi domain'ini bir A kaydıyla sunucu IP'sine yönlendir. Step 7'deki **geçersiz SSL sertifikası bilinçlidir** — oyunun bir parçası — gerçek bir cert (Let's Encrypt vb.) ALMA.

## Yapılandırma

`src/CurlMaster.Api/appsettings.json` içindeki `Game` bölümü tüm oyun parametrelerini tutar. Production'da ortam değişkenleriyle override etmeyi tercih et.

## Lisans

GDG on Campus PAU eğitim materyali.
