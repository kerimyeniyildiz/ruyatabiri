import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma, DreamTitleStatus } from "@/lib/prisma";
import { siteConfig } from "@/config/site";

export const revalidate = 86_400;

type PageProps = {
  params: { slug: string };
};

export async function generateStaticParams() {
  const titles = await prisma.dreamTitle.findMany({
    where: { status: DreamTitleStatus.PUBLISHED },
    select: { slug: true },
    take: 200,
  });

  return titles.map((title) => ({ slug: title.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const dream = await prisma.dreamTitle.findUnique({
    where: { slug: params.slug },
    select: {
      title: true,
      metaTitle: true,
      metaDescription: true,
      status: true,
      imageUrl: true,
      imageAlt: true,
      publishedAt: true,
    },
  });

  if (!dream || dream.status !== DreamTitleStatus.PUBLISHED) {
    return {};
  }

  const title = dream.metaTitle?.trim() || `${dream.title} Rüya Tabiri`;
  const description =
    dream.metaDescription?.trim() ??
    `${dream.title} rüyasının anlamı, detaylı yorumlar ve olası mesajları.`;
  const url = `${siteConfig.baseUrl}/ruya/${params.slug}`;
  const imageUrl = dream.imageUrl ?? `${siteConfig.cdnBaseUrl ?? siteConfig.baseUrl}/og-default.png`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: { "tr-TR": url },
    },
    openGraph: {
      type: "article",
      locale: "tr_TR",
      title,
      description,
      url,
      siteName: siteConfig.name,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: dream.imageAlt ?? title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function DreamPage({ params }: PageProps) {
  const dream = await prisma.dreamTitle.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      title: true,
      contentHtml: true,
      contentToc: true,
      relatedKeywords: true,
      faqs: true,
      imageUrl: true,
      imageAlt: true,
      metaDescription: true,
      publishedAt: true,
      status: true,
    },
  });

  if (!dream || dream.status !== DreamTitleStatus.PUBLISHED) {
    notFound();
  }

  const jsonLd = buildJsonLd({ dream, slug: params.slug });

  return (
    <article className="mx-auto max-w-3xl space-y-8 px-4 py-12">
      <header className="space-y-4">
        <nav className="text-xs text-slate-500">
          <ol className="flex items-center gap-2">
            <li>
              <a href="/" className="hover:text-slate-900">
                Ana sayfa
              </a>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <a href="/ruya" className="hover:text-slate-900">
                Rüya Tabirleri
              </a>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-slate-700">
              {dream.title}
            </li>
          </ol>
        </nav>
        <h1 className="text-3xl font-semibold text-slate-900">{dream.title}</h1>
        {dream.publishedAt && (
          <p className="text-sm text-slate-500">
            Yayın tarihi:{" "}
            {new Date(dream.publishedAt).toLocaleDateString("tr-TR", {
              dateStyle: "long",
            })}
          </p>
        )}
      </header>

      {dream.imageUrl && (
        <figure className="relative overflow-hidden rounded-xl border border-slate-200 shadow-sm">
          <Image
            src={dream.imageUrl}
            alt={dream.imageAlt ?? dream.title}
            width={1200}
            height={630}
            className="h-auto w-full object-cover"
            priority
          />
        </figure>
      )}

      {Array.isArray(dream.contentToc) && dream.contentToc.length > 0 && (
        <aside className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <p className="font-medium text-slate-900">İçindekiler</p>
          <ul className="mt-2 space-y-1 marker:text-slate-400">
            {dream.contentToc.map((item) => (
              <li key={item.toString()} className="list-disc list-inside">
                {item}
              </li>
            ))}
          </ul>
        </aside>
      )}

      <section
        className="prose prose-slate max-w-none text-slate-800"
        dangerouslySetInnerHTML={{ __html: dream.contentHtml }}
      />

      {Array.isArray(dream.relatedKeywords) && dream.relatedKeywords.length > 0 && (
        <section className="space-y-2">
          <p className="text-sm font-medium text-slate-700">İlgili anahtar kelimeler</p>
          <div className="flex flex-wrap gap-2">
            {dream.relatedKeywords.map((keyword) => (
              <span
                key={keyword}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
              >
                {keyword}
              </span>
            ))}
          </div>
        </section>
      )}

      {Array.isArray(dream.faqs) && dream.faqs.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-slate-900">Sıkça Sorulan Sorular</h2>
          <div className="space-y-2">
            {dream.faqs.map((faq: any, index: number) => (
              <details
                key={index}
                className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700"
              >
                <summary className="font-medium text-slate-900">{faq.question}</summary>
                <p className="mt-2 text-sm text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd, null, 2) }}
      />
    </article>
  );
}

function buildJsonLd({
  dream,
  slug,
}: {
  dream: {
    title: string;
    metaDescription: string | null | undefined;
    imageUrl: string | null;
    imageAlt: string | null;
    publishedAt: Date | null;
  };
  slug: string;
}) {
  const url = `${siteConfig.baseUrl}/ruya/${slug}`;
  const publishedAt = dream.publishedAt?.toISOString() ?? new Date().toISOString();

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: dream.title,
    description:
      dream.metaDescription ??
      `${dream.title} rüyasının anlamı ve yorumları hakkında detaylı içerik.`,
    image: dream.imageUrl ?? "",
    author: {
      "@type": "Organization",
      name: siteConfig.name,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: url,
    datePublished: publishedAt,
    dateModified: publishedAt,
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Ana sayfa",
        item: siteConfig.baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Rüya Tabirleri",
        item: `${siteConfig.baseUrl}/ruya`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: dream.title,
        item: url,
      },
    ],
  };

  return [article, breadcrumb];
}
