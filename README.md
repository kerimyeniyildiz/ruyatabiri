
# Rüya Tabiri Platformu

Replicate üzerinde GPT-5 kullanarak rüya tabiri içerikleri ve Nano Banana modeliyle görseller üreten, Cloudflare R2’ye yükleyen ve Dokploy ile dağıtılmak üzere hazırlanan Next.js tabanlı platform.

## Monorepo Yapısı

- `apps/web` – Next.js (App Router) uygulaması, admin paneli ve kamu içerik sayfaları.
- `apps/worker` – pg-boss kuyruk tüketicileri, içerik/görsel üretim ve yayınlama işleyicileri.
- `packages/database` – Prisma şeması, paylaşılan Prisma Client.
- `docs/architecture.md` – Detaylı mimari ve veri akışı dökümanı.

## Geliştirme

```bash
# Bağımlılıkları yükle
npm install

# Prisma client üret
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ruya?schema=public" npm run prisma:generate

# Web uygulaması
npm run dev:web

# Worker (ayrı terminalde)
npm run dev:worker
```

Gerekli ortam değişkenlerini `.env` dosyasına `.env.example` üzerinden ekleyin. Varsayılan veritabanı adresi Docker Compose servis adı `db` olacak şekilde ayarlanmıştır.

## Docker & Dokploy

```bash
docker compose up --build
```

- `Dockerfile.web`: Next.js standalone build (Node 20, `NEXT_TELEMETRY_DISABLED=1`).
- `Dockerfile.worker`: Worker build (tsup çıktısı).
- `docker-compose.yml`: Postgres 16, web ve worker servisleri, kalıcı `pgdata` volume’u.

Dokploy üzerinde web ve worker için ayrı uygulamalar tanımlayın, `.env` değerlerini paylaşın ve Postgres volume’unu kalıcı hale getirin.

## Kuyruklar & İş Akışı

- `dream:text` → GPT-5 (placeholder) içerik üretimi, `DreamTitle` güncellemesi ve `dream:image` kuyruğuna geçiş.
- `dream:image` → Nano Banana (placeholder) görsel üretimi ve R2 yükleme altyapısı (TODO).
- `dream:publish` → İçeriği `PUBLISHED` yapar, ISR revalidate çağrısı gönderir.

Worker pipeline dosyaları (`apps/worker/src/pipeline/*.ts`) şu an yer tutucu içerikler döndürür; Replicate ve Cloudflare R2 entegrasyonları TODO notlarıyla belirtilmiştir.

## Admin Paneli

- `/admin` (Basic Auth + middleware koruması)
- Özellikler:
  - Başlık içe aktarma (`/admin/import`) – `.txt` veya metin alanı üzerinden. Sunucu eylemi `importDreamTitles`.
  - Başlık listesi (`/admin/titles`) – son 25 kayıt.
  - Ayarlar (`/admin/settings`) – tempo, promptlar, limitler, SEO varsayılanları.
- API uçları `requireInternalSecret` ile ekstra shared-secret kontrolü uygular.

## Sağlık ve Gözlemlenebilirlik

- `GET /api/healthz` – basit canlılık.
- `GET /api/readyz` – Postgres bağlantı kontrolü.
- Pino log’ları hem web (server tarafı) hem worker’da kullanılmaya uygundur (worker’da aktif).

## Testler & Sonraki Adımlar

- Birim testleri (slugify, env doğrulama, scheduler) için Jest/Vitest entegrasyonu eklenmeli.
- Replicate çağrıları ve Cloudflare R2 yükleyicisi implementasyonu.
- pg-boss zamanlayıcısı ve publish kuyruk tetikleyicisi.
- Playwright E2E senaryoları (SEO doğrulamaları, admin akışı).

Detaylı gereksinimler ve TODO’lar için `docs/architecture.md` dökümanına bakabilirsiniz.
