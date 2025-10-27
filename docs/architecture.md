# Rüya Tabiri Platform – Teknik Mimari

## Genel Bakış
- **Amaç:** Rüya tabiri başlıklarını kuyruğa alıp, GPT-5 tabanlı içerik ve Nano Banana tabanlı görseller üreterek Cloudflare R2’ye yükleyen, Dokploy üzerinde çalışan, SEO ve performans odaklı Next.js uygulaması.
- **Bileşenler:** Next.js web uygulaması, Node.js worker (pg-boss tüketicileri), PostgreSQL, Replicate API, Cloudflare R2, Dokploy dağıtımı.
- **Dil & Çatılar:** TypeScript, Next.js App Router, TailwindCSS, Prisma ORM, pg-boss, sharp, pino.

## Bileşen Diyagramı
```
.txt -> Admin Import -> DreamTitle (QUEUED)
                          |
                         pg-boss
                          |
     ┌─────────────── Web App ───────────────┐
     │  /admin (Next.js SSR + ISR)           │
     │  İçerik görüntüleme (ISR)             │
     └─────────────────┬─────────────────────┘
                       │
                Worker (Node.js)
        ┌──────────────┼───────────────┬──────────────┐
        │dream:text     │dream:image    │dream:publish │
        │Replicate GPT-5│Replicate Nano │Sitemap, ISR   │
        │JSON parse     │Banana + sharp │Revalidate     │
        └───────────────┴──────────────┴───────────────┘
                          │
                       Cloudflare R2 (S3)
                          │
                     CDN (immutable cache)
```

## Veri Modeli
- **DreamTitle:** Başlık, slug, üretim ve yayın durum bilgileri, SEO meta verileri, içerik HTML/TOC, görsel URL/alt, ilişkili anahtar kelimeler, hata kaydı, öncelik, planlanmış zaman, yayın zamanı.
- **GenerationJob:** Metin/görsel işlerinin durum, süre, maliyet, hata, Replicate prediction kimliği.
- **Settings:** Scheduler, promptlar, limitler, SEO varsayılanları.
- **İndeksler:** slug unique, status, scheduledFor, publishedAt; GenerationJob.dreamTitleId; Settings.key unique.

## Kuyruk & İşleme
- **pg-boss Kuyrukları:** `dream:text`, `dream:image`, `dream:publish`.
- **İş Sırası:** Text job JSON döndürür → veritabanına yazar → image job tetikler → görsel Cloudflare R2’ye yüklenir → publish job ISR & sitemap.
- **Retry & Backoff:** Varsayılan 3 deneme, exponential backoff; günlük üretim limiti kontrolü.
- **Eşzamanlılık:** Metin ve görsel işlerinde ayrı concurrency sınırları (ör. 2).

## API ve Arayüzler
- **Frontend:** `/ruya/[slug]` sayfaları ISR (24 saat). SEO: canonical, hreflang, OG/Twitter, JSON-LD (Article + Breadcrumb), lazy load, next/image remote loader, LCP<2.5s.
- **Admin:** Basic Auth + shared secret. Özellikler: .txt import önizleme, başlık yönetimi, job tetikleme, ayar güncelleme, metrikler.
- **Internal API:** `/api/admin/import`, `/api/admin/generate-now/:id`, `/api/admin/settings`, `/api/revalidate`, `/api/healthz`, `/api/readyz`. Shared secret doğrulaması.

## Üçüncü Parti Entegrasyonlar
- **Replicate GPT-5:** `openai/gpt-5-structured` tercih, fallback `openai/gpt-5`. Structured JSON schema ile SEO, article, image output.
- **Replicate Nano Banana:** Görsel üretim → sharp ile 1200x630 & 800w WebP.
- **Cloudflare R2:** S3 uyumlu API. Dosya yolu: `images/YYYY/MM/slug/{og|content}.webp`. Cache-Control: `public, max-age=31536000, immutable`.
- **Dokploy:** Web ve worker için ayrı container. PostgreSQL volume `pgdata`.

## Gözlemlenebilirlik
- **Loglama:** pino, request/job correlation ID.
- **Metrikler:** Günlük job sayısı, hata oranı, gecikme. Admin dashboard’da özet.
- **Health Checks:** `/api/healthz`, `/api/readyz`.

## Güvenlik
- Basic Auth (admin).
- Shared secret header/body (`INTERNAL_WEBHOOK_SECRET`) ile internal API koruması.
- Rate limiting (TODO: uygulama seviyesinde middleware).
- Gizli anahtarlar `.env` üzerinden.

## Test Stratejisi
- **Unit:** Slugify helper, SEO validasyon, timezone planlayıcı, R2 yükleyici.
- **Integration:** Replicate API mockları ile text→image→publish akışı, pg-boss job order.
- **E2E:** Playwright ile yayın sayfası SEO doğrulaması ve temel CWV ölçümü (lokal).

## Dağıtım Boru Hattı
1. Docker image build (web & worker).
2. Prisma migrate + seed.
3. Dokploy deployment (web + worker + Postgres volume).
4. Cloudflare R2 + CDN (1 yıl immutable cache).
5. Domain Cloudflare CDN arkasında, HTTPS.

## Açık Konular
- Replicate quota ve hata senaryoları için özel fallback politikaları.
- Scheduler için hassas zamanlama (cron benzeri) – Node cron veya pg-boss planlayıcısı?
- Admin UI kimlik doğrulaması için ek IP sınırlaması ihtiyacı?

