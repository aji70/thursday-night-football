"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppChrome } from "@/components/AppChrome";

type Post = {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  week: number | null;
  createdAt: string;
};

export function NewsClient() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/news")
      .then((r) => r.json())
      .then((d) => setPosts(d.posts ?? []))
      .catch(() => setError("Could not load news"));
  }, []);

  return (
    <AppChrome title="News">
      <p className="max-w-xl text-muted">
        Matchday stories, results, and league updates.
      </p>
      {error ? <p className="mt-6 text-danger">{error}</p> : null}
      <ul className="mt-8 space-y-4">
        {posts.length === 0 ? (
          <li className="text-muted">No news yet — check back after Matchday 1.</li>
        ) : (
          posts.map((p) => (
            <li key={p.id} className="border border-line px-4 py-4">
              <Link href={`/news/${p.id}`} className="block hover:opacity-90">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-flood">
                  {p.pinned ? "Pinned" : p.week ? `Week ${p.week}` : "Update"}
                  {" · "}
                  {new Date(p.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <h2 className="font-display mt-1 text-2xl text-chalk">
                  {p.title}
                </h2>
                <p className="mt-2 line-clamp-3 text-sm text-muted whitespace-pre-line">
                  {p.body}
                </p>
              </Link>
            </li>
          ))
        )}
      </ul>
    </AppChrome>
  );
}
