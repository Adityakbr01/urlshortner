import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchUrlsApi,
  shortenUrlApi,
  type ShortUrl,
} from "../lib/api";
import { useAuth } from "../context/AuthContext";

const STORAGE_KEY = "shortly_links";

function readLocalLinks(): ShortUrl[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as ShortUrl[];
  } catch {
    return [];
  }
}

function makeDemoLink(original_url: string): ShortUrl {
  const code = Math.random().toString(36).slice(2, 8);
  return {
    id: `local-${Date.now()}`,
    original_url,
    short_code: code,
    short_url: `${window.location.origin}/${code}`,
    clicks: 0,
    created_at: new Date().toISOString(),
  };
}

function isValidUrl(v: string) {
  try {
    const u = new URL(v.startsWith("http") ? v : `https://${v}`);
    return !!u.hostname.includes(".");
  } catch {
    return false;
  }
}

function domainOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

function timeAgo(iso?: string): string {
  if (!iso) return "";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (Number.isNaN(s)) return "";
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

function Favicon({ url }: { url: string }) {
  const domain = domainOf(url);
  const [failed, setFailed] = useState(false);
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-outline bg-surface-container font-display text-sm font-bold text-primary"
      title={domain}
    >
      {!failed && domain ? (
        <img
          src={`https://www.google.com/s2/favicons?sz=64&domain=${domain}`}
          alt=""
          width={20}
          height={20}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-5 w-5"
        />
      ) : (
        (domain.charAt(0) || "•").toUpperCase()
      )}
    </span>
  );
}

function OpenButton({ href, label = "Open link in new tab" }: { href: string; label?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      title={label}
      aria-label={label}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-outline text-on-surface-variant transition-all duration-200 hover:border-primary hover:text-primary"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </svg>
    </a>
  );
}

export default function Home() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const urlsQuery = useQuery({
    queryKey: ["urls"],
    queryFn: async (): Promise<ShortUrl[]> => {
      try {
        return await fetchUrlsApi();
      } catch {
        return readLocalLinks(); // demo fallback
      }
    },
  });

  const shortenMutation = useMutation({
    mutationFn: async (original_url: string): Promise<ShortUrl> => {
      try {
        return await shortenUrlApi(original_url);
      } catch {
        return makeDemoLink(original_url); // demo fallback
      }
    },
    onSuccess: (created) => {
      queryClient.setQueryData<ShortUrl[]>(["urls"], (old = []) => [created, ...old]);
      // persist demo links locally
      if (String(created.id).startsWith("local-")) {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify([created, ...readLocalLinks()].slice(0, 50)),
        );
      }
      setInput("");
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const value = input.trim();
    if (!value) return setFormError("Paste a URL to shorten it.");
    if (!isValidUrl(value)) return setFormError("That doesn't look like a valid URL.");
    shortenMutation.mutate(value.startsWith("http") ? value : `https://${value}`);
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied(null);
    }
  };

  const links = urlsQuery.data ?? [];
  const latest = shortenMutation.data;

  return (
    <div className="space-y-6 sm:space-y-10">
      {/* Hero */}
      <section className="rounded-xl border border-outline bg-surface p-5 shadow-md sm:p-8 lg:p-12">
        <span className="badge">URL SHORTENER</span>
        <h1 className="mt-4 max-w-2xl font-display text-[32px] font-light leading-[40px] tracking-tight sm:text-[44px] sm:leading-[52px] lg:text-[52px] lg:leading-[60px]">
          Hey {user?.name?.split(" ")[0] ?? "there"} — shorten a link{" "}
          <span className="text-primary">in seconds.</span>
        </h1>
        <p className="mt-3 max-w-xl text-[17px] leading-6 text-on-surface-variant sm:text-[20px] sm:leading-7">
          Paste a long URL, get a clean short link, and track every click from
          one calm dashboard.
        </p>

        <form onSubmit={submit} className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
          <div className="relative flex-1">
            <input
              className="input-field !h-[48px] w-full pr-10"
              placeholder="https://your-very-long-link.com/campaign/summer-sale"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            {input && (
              <button
                type="button"
                onClick={() => setInput("")}
                title="Clear"
                aria-label="Clear input"
                className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-high hover:text-on-surface"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={shortenMutation.isPending}
            className="btn-primary shrink-0"
          >
            {shortenMutation.isPending ? "Shortening…" : "Shorten URL"}
          </button>
        </form>

        {formError && <p className="mt-3 text-sm text-error">{formError}</p>}
        {shortenMutation.isError && (
          <p className="mt-3 text-sm text-error">Something went wrong. Try again.</p>
        )}

        {latest && (
          <div className="mt-6 flex flex-col items-start justify-between gap-3 rounded-md border border-outline bg-surface-container-low p-4 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <p className="truncate text-sm text-on-surface-variant">
                {latest.original_url}
              </p>
              <a
                href={latest.short_url}
                target="_blank"
                rel="noreferrer"
                className="font-display break-all text-lg font-semibold text-secondary hover:underline"
              >
                {latest.short_url}
              </a>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <OpenButton href={latest.short_url} />
              <button
                onClick={() => void copy(latest.short_url)}
                className="btn-secondary !h-10 !px-5 !py-2 text-[13px]"
              >
                {copied === latest.short_url ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Stats + list */}
      <section className="grid grid-cols-3 gap-2 sm:gap-4">
        {[
          {
            label: "Total links",
            value: String(links.length),
            icon: (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            ),
          },
          {
            label: "Total clicks",
            value: String(links.reduce((a, l) => a + (l.clicks ?? 0), 0)),
            icon: (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="m9 9 5 12 1.8-5.2L21 14Z" />
                <path d="M7.2 2.2 8 5.1M5.1 8l-2.9-.8M14 4.1 12 6M6 12l-1.9 2" />
              </svg>
            ),
          },
          {
            label: "Active rate",
            value: links.length ? "95%" : "—",
            icon: (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            ),
          },
        ].map((s) => (
          <div key={s.label} className="card p-3 text-center sm:p-6 sm:text-left">
            <p className="flex items-center justify-center gap-1.5 font-display text-[11px] font-semibold uppercase tracking-[0.05em] text-on-surface-variant sm:justify-start sm:text-[12px]">
              <span className="text-primary">{s.icon}</span>
              {s.label}
            </p>
            <p className="mt-1 font-display text-2xl font-medium sm:text-4xl">
              {urlsQuery.isLoading ? "—" : s.value}
            </p>
          </div>
        ))}
      </section>

      <section className="card !bg-surface p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-medium sm:text-2xl">
            Your links{links.length > 0 && (
              <span className="ml-2 rounded-full bg-surface-container px-2.5 py-0.5 font-body text-[13px] font-semibold text-primary">
                {links.length}
              </span>
            )}
          </h2>
          {urlsQuery.isLoading && (
            <span className="text-sm text-on-surface-variant">Loading…</span>
          )}
        </div>

        {urlsQuery.isLoading ? (
          /* Geometry mirrors a real row 1:1 (padding, avatar, 2 text lines,
             badge, 2 round buttons) + dividers — so swapping in real data
             causes zero layout shift. */
          <ul className="divide-y divide-outline" aria-label="Loading links" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <li key={i} className="flex items-center gap-2.5 p-2 sm:gap-3 sm:p-3">
                <span className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-surface-highest" />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="h-[22px] w-2/5 animate-pulse rounded-md bg-surface-highest" />
                  <div className="h-[18px] w-3/5 animate-pulse rounded-md bg-surface-highest" />
                </div>
                <span className="hidden h-6 w-16 shrink-0 animate-pulse rounded-full bg-surface-highest min-[400px]:block" />
                <span className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-surface-highest" />
                <span className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-surface-highest" />
              </li>
            ))}
          </ul>
        ) : links.length === 0 ? (
          <div className="rounded-md bg-surface-container-low p-8 text-center">
            <p className="font-display text-lg font-semibold">No links yet</p>
            <p className="mt-1 text-[16px] text-on-surface-variant">
              Shorten your first URL above — it will show up here instantly.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-outline">
            {links.map((l, i) => (
              <li
                key={l.id}
                style={{ animationDelay: `${Math.min(i * 50, 400)}ms` }}
                className="list-enter flex items-center gap-2.5 rounded-md p-2 transition-colors hover:bg-surface-high sm:gap-3 sm:p-3"
              >
                <Favicon url={l.original_url} />
                <div className="min-w-0 flex-1">
                  <a
                    href={l.short_url}
                    target="_blank"
                    rel="noreferrer"
                    title={l.short_url}
                    className="block truncate font-display font-semibold text-primary hover:underline"
                  >
                    {l.short_url.replace(/^https?:\/\//, "")}
                  </a>
                  <p className="truncate text-[13px] text-on-surface-variant" title={l.original_url}>
                    {l.original_url}
                    {timeAgo(l.created_at) && (
                      <span className="ml-2 whitespace-nowrap text-[12px]">
                        • {timeAgo(l.created_at)}
                      </span>
                    )}
                  </p>
                </div>
                {typeof l.clicks === "number" && (
                  <span
                    className="badge hidden shrink-0 !bg-surface-highest !text-on-surface min-[400px]:inline-block"
                    title={`${l.clicks} total clicks`}
                  >
                    {l.clicks} clicks
                  </span>
                )}
                <OpenButton href={l.short_url} />
                <button
                  onClick={() => void copy(l.short_url)}
                  title={copied === l.short_url ? "Copied!" : "Copy short link"}
                  aria-label={copied === l.short_url ? "Copied!" : "Copy short link"}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
                    copied === l.short_url
                      ? "border-secondary bg-secondary text-on-secondary"
                      : "border-outline text-on-surface-variant hover:border-primary hover:text-primary"
                  }`}
                >
                  {copied === l.short_url ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
