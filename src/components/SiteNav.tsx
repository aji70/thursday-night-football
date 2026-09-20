"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type AuthPlayer = {
  name: string;
  isAdmin?: boolean;
  status?: string;
};

const pageLinks = [
  { href: "/", label: "Rules" },
  { href: "/tables", label: "Tables" },
  { href: "/players", label: "Players" },
  { href: "/payments", label: "Payments" },
  { href: "/purse", label: "Purse" },
  { href: "/feedback", label: "Feedback" },
];

export function SiteNav({
  variant = "app",
  sectionLinks = [],
}: {
  variant?: "home" | "app";
  sectionLinks?: { href: string; label: string }[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [player, setPlayer] = useState<AuthPlayer | null>(null);
  const [loaded, setLoaded] = useState(false);

  const refreshAuth = useCallback(() => {
    fetch("/api/auth/login")
      .then((r) => r.json())
      .then((data) => {
        setPlayer(data.player ?? null);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth, pathname]);

  async function logout() {
    await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    setPlayer(null);
    router.push("/");
    router.refresh();
  }

  const linkClass =
    variant === "home"
      ? "text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-flood-soft transition hover:text-chalk"
      : "text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted transition hover:text-chalk";

  const sectionClass =
    "text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted transition hover:text-chalk";

  return (
    <>
      <nav
        className={
          variant === "home"
            ? "hidden items-center gap-4 lg:flex xl:gap-5"
            : "flex flex-wrap items-center justify-end gap-3 sm:gap-4"
        }
        aria-label="Primary"
      >
        {pageLinks.map((link) => (
          <Link key={link.href} href={link.href} className={linkClass}>
            {link.label}
          </Link>
        ))}
        {sectionLinks.map((link) => (
          <a key={link.href} href={link.href} className={sectionClass}>
            {link.label}
          </a>
        ))}
        {player ? (
          <>
            <Link href="/me" className={linkClass}>
              {player.name.split(" ")[0] || "Profile"}
            </Link>
            {player.isAdmin ? (
              <Link href="/admin" className={linkClass}>
                Admin
              </Link>
            ) : null}
          </>
        ) : null}
      </nav>

      <div className="flex items-center gap-2">
        {!loaded ? null : player ? (
          <button
            type="button"
            onClick={logout}
            className="border border-line px-3 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-muted transition hover:border-chalk/40 hover:text-chalk"
          >
            Log out
          </button>
        ) : (
          <>
            <Link
              href="/login"
              className="border border-line px-3 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-muted transition hover:border-chalk/40 hover:text-chalk"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="bg-flood px-3 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-pitch-deep transition hover:bg-flood-soft"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </>
  );
}
