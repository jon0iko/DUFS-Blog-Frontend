import { useState, useEffect } from "react";
import { config } from "@/lib/config";
import { Article } from "@/types";

export function useViewCount(article: Article | null, slug: string): number {
  const [viewCount, setViewCount] = useState(0);

  // Sync initial value when article loads
  useEffect(() => {
    if (article?.viewCount !== undefined) {
      setViewCount(article.viewCount);
    }
  }, [article?.id]);

  // Fire-and-forget view count increment (once per session per slug)
  useEffect(() => {
    if (!article?.documentId) return;

    const key = `viewed_${slug}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      fetch(`${config.strapi.url}/api/articles/${slug}/view`, {
        method: "POST",
      })
        .then((res) => {
          if (res.ok) return res.json();
        })
        .then((data) => {
          if (data?.viewCount !== undefined) {
            setViewCount(data.viewCount);
          }
        })
        .catch(() => {
          console.error("Error incrementing view count");
        });
    }
  }, [article?.documentId, slug]);

  return viewCount;
}
