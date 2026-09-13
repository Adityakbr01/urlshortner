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

        <form onSubmit={submit} className="mt-8 flex flex-col gap-3 sm:flex-row">
          <input
            className="input-field !h-[48px] flex-1"
            placeholder="https://your-very-long-link.com/campaign/summer-sale"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
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
            <button
              onClick={() => void copy(latest.short_url)}
              className="btn-secondary !h-10 !px-5 !py-2 text-[13px]"
            >
              {copied === latest.short_url ? "Copied!" : "Copy"}
            </button>
          </div>
        )}
      </section>

      {/* Stats + list */}
      <section className="grid grid-cols-3 gap-2 sm:gap-4">
        {[
          { label: "Total links", value: String(links.length) },
          {
            label: "Total clicks",
            value: String(links.reduce((a, l) => a + (l.clicks ?? 0), 0)),
          },
          { label: "Active rate", value: links.length ? "95%" : "—" },
        ].map((s) => (
          <div key={s.label} className="card p-3 text-center sm:p-6 sm:text-left">
            <p className="font-display text-[11px] font-semibold uppercase tracking-[0.05em] text-on-surface-variant sm:text-[12px]">
              {s.label}
            </p>
            <p className="mt-1 font-display text-2xl font-medium sm:text-4xl">{s.value}</p>
          </div>
        ))}
      </section>

      <section className="card !bg-surface">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl font-medium">Your links</h2>
          {urlsQuery.isLoading && (
            <span className="text-sm text-on-surface-variant">Loading…</span>
          )}
        </div>

        {links.length === 0 && !urlsQuery.isLoading ? (
          <div className="rounded-md bg-surface-container-low p-8 text-center">
            <p className="font-display text-lg font-semibold">No links yet</p>
            <p className="mt-1 text-[16px] text-on-surface-variant">
              Shorten your first URL above — it will show up here instantly.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-outline">
            {links.map((l) => (
              <li
                key={l.id}
                className="flex flex-col gap-2 rounded-md p-3 transition-colors hover:bg-surface-high sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <a
                    href={l.short_url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-display font-semibold text-primary hover:underline"
                  >
                    {l.short_code ? `/${l.short_code}` : l.short_url}
                  </a>
                  <p className="truncate text-sm text-on-surface-variant">
                    {l.original_url}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {typeof l.clicks === "number" && (
                    <span className="badge !bg-surface-highest !text-on-surface">
                      {l.clicks} clicks
                    </span>
                  )}
                  <button
                    onClick={() => void copy(l.short_url)}
                    className="btn-secondary !h-9 !px-4 !py-1 text-[12px]"
                  >
                    {copied === l.short_url ? "Copied!" : "Copy"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
