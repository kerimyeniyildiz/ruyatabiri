
export type DreamJobPayload = {
  dreamTitleId: string;
  retryCount?: number;
};

export type GeneratedArticle = {
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
  article: {
    title: string;
    html: string;
    relatedKeywords: string[];
    toc?: string[];
  };
  image: {
    prompt: string;
    alt: string;
  };
  faqs?: Array<{ question: string; answer: string }>;
};
