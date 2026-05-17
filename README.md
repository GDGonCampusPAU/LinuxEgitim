# Linux Treasure Hunt: The Curl Master

GDG on Campus PAU için Linux/terminal eğitim oyunu backend'i. Katılımcılar yalnızca `curl` komutu kullanarak 5 adımlı bir hazine avını çözer.

## Mimari

- **.NET 10** ASP.NET Core Minimal API
- **Kestrel** çift listener: HTTP + HTTPS (self-signed cert)
- **JSON dosya** tabanlı skorbord (Docker volume ile kalıcı)
- **SharpZipLib** ile parola korumalı arşiv üretimi
- **Docker** ile tek komutta deploy

## Oyun Akışı

| Adım | Endpoint | Davranış |
|------|----------|----------|
| 1 | `GET /uyanis` | Başlangıç metni |
| 2 | `GET /kapi` (veya HEAD) | `X-Yol` header'ı ile bir sonraki adımı bildirir |
| 3 | `GET /arsiv` | `arsiv.txt` indirme — kasanın yolu ve şifre ipucu |
| 4 | `GET /kasa/kalinti.zip` | Parola korumalı zip (içinde `sistem.txt`, `veriler.txt`, `beni_oku.txt`) |
| 5 | `POST /sunak` | Form-data: `name`, `code` — skorboarda yazar (rate-limited) |

### Public ek endpoint'ler

| Endpoint | Açıklama |
|----------|----------|
| `GET /` | Lobi metni — `/uyanis`'a yönlendirir |
| `GET /oyun/durum` | Frontend için özet: durum, toplam yolcu, ilk 3 |
| `GET /skor` | Tüm kazananların JSON listesi |
| `GET /saglik` | Sağlık kontrolü |

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
- `wwwroot/arsiv.txt` — 3. adımda servis edilecek ipucu metni
- `wwwroot/kalinti.zip` — parola korumalı arşiv; `sistem.txt` içinde ACCESS_CODE gömülü, `veriler.txt` ve `beni_oku.txt` decoy

Servis dinler: `http://localhost:8080` ve `https://localhost:8443`.

### Hızlı test

```bash
curl http://localhost:8080/uyanis
curl -I http://localhost:8080/kapi
curl -O http://localhost:8080/arsiv
curl -O http://localhost:8080/kasa/kalinti.zip
unzip -P gdgvesiberay kalinti.zip
grep "kod=" sistem.txt
curl -X POST -d "name=Furkan&code=linuxegitim101" http://localhost:8080/sunak
curl http://localhost:8080/skor
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
| `ACCESS_CODE` | `linuxegitim101` | POST /sunak doğrulama kodu |
| `ARCHIVE_PASSWORD` | `gdgvesiberay` | kalinti.zip parolası |
| `CERT_PASSWORD` | `curlmaster` | PFX dosya parolası |
| `ADMIN_API_KEY` | `change-me-in-production` | `/admin/*` endpoint'leri için Bearer token. **Production'da boş veya default değer ise servis startup'ta fail eder.** |
| `CORS_ALLOWED_ORIGINS` | (boş = hepsi) | Frontend origin'i, ör: `https://app.example.com`. Public oyun için boş bırakılabilir; ayrı bir frontend domain'i varsa set et. |
| `KNOWN_PROXY` | (boş) | Reverse proxy (nginx, Cloudflare tek IP) arkasındaysa proxy IP'si. Rate-limit'in gerçek istemci IP'sine göre çalışması için gerekli. |
| `KNOWN_NETWORK` | (boş) | Reverse proxy CIDR aralığı, ör: `173.245.48.0/20`. Cloudflare gibi çoklu IP havuzu kullanan sağlayıcılar için. |

Persist edilen volume'lar:
- `./data` — `scoreboard.json` (kazananlar listesi)
- `./certs` — `dev-cert.pfx` (yeniden başlatmalar arası aynı cert)

`wwwroot/` içeriği container'da kalır; **`ACCESS_CODE` değiştirip restart yapmak istersen** container'ı yeni `.env` ile yeniden build et: `docker compose up -d --build --force-recreate`.

### Sağlık kontrolü

```bash
curl http://<host>/saglik
docker compose ps          # healthcheck durumunu gösterir
```

### Logları izle

```bash
docker compose logs -f curlmaster
```

## DNS / Domain Notu

PDF'lerdeki `api.col` örnek bir domain. Gerçek deploy için kendi domain'ini bir A kaydıyla sunucu IP'sine yönlendir. HTTPS listener self-signed cert kullanır — gerçek bir cert almaya gerek yok; oyun HTTP üzerinden çalışır.

## Yapılandırma

`src/CurlMaster.Api/appsettings.json` içindeki `Game` bölümü tüm oyun parametrelerini tutar. Production'da ortam değişkenleriyle override etmeyi tercih et.

## Lisans

GDG on Campus PAU eğitim materyali.
