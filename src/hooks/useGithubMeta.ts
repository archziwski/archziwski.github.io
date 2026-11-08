import { useEffect, useState } from "react";

export interface RepoLive {
  stars: number | null;
  tag: string | null;
}

const CACHE_KEY = "arch-gh-meta-v1";
const CACHE_TTL = 1000 * 60 * 60; // 1 saat

type CacheMap = Record<string, { t: number; data: RepoLive }>;

function readCache(): CacheMap {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}") as CacheMap;
  } catch {
    return {};
  }
}

/**
 * Repo'lar için canlı GitHub verisi (yıldız + son sürüm).
 * 1 saatlik localStorage önbelleğiyle çalışır; erişilemezse sessizce
 * boş döner ve arayüz statik metaya düşer.
 */
export function useGithubMeta(repos: string[]): Record<string, RepoLive> {
  const cacheKey = repos.join("|");

  const [meta, setMeta] = useState<Record<string, RepoLive>>(() => {
    const cache = readCache();
    const out: Record<string, RepoLive> = {};
    for (const r of repos) {
      const e = cache[r];
      if (e && Date.now() - e.t < CACHE_TTL) out[r] = e.data;
    }
    return out;
  });

  useEffect(() => {
    let alive = true;
    const list = cacheKey.split("|");
    const cache = readCache();
    const missing = list.filter((r) => !(cache[r] && Date.now() - cache[r].t < CACHE_TTL));
    if (missing.length === 0) return;

    (async () => {
      const headers = { Accept: "application/vnd.github+json" };
      const entries = await Promise.all(
        missing.map(async (repo): Promise<[string, RepoLive]> => {
          const data: RepoLive = { stars: null, tag: null };
          const [repoRes, relRes] = await Promise.allSettled([
            fetch(`https://api.github.com/repos/${repo}`, { headers }),
            fetch(`https://api.github.com/repos/${repo}/releases/latest`, { headers }),
          ]);
          if (repoRes.status === "fulfilled" && repoRes.value.ok) {
            try {
              const j = await repoRes.value.json();
              if (typeof j.stargazers_count === "number") data.stars = j.stargazers_count;
            } catch {
              /* boşver */
            }
          }
          if (relRes.status === "fulfilled" && relRes.value.ok) {
            try {
              const j = await relRes.value.json();
              if (typeof j.tag_name === "string") data.tag = j.tag_name;
            } catch {
              /* boşver */
            }
          }
          return [repo, data];
        }),
      );
      if (!alive) return;

      const next: Record<string, RepoLive> = {};
      const newCache = readCache();
      for (const [repo, data] of entries) {
        next[repo] = data;
        newCache[repo] = { t: Date.now(), data };
      }
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(newCache));
      } catch {
        /* boşver */
      }
      setMeta((prev) => ({ ...prev, ...next }));
    })();

    return () => {
      alive = false;
    };
  }, [cacheKey]);

  return meta;
}
