"use client";

import { useState, useEffect, useCallback } from "react";
import { Article, Source, CATEGORY_LABELS } from "@/lib/types";

// ─── Password Gate ──────────────────────────────────────────────
const ADMIN_PIN = "kosher2024";

function LoginGate({ onAuth }: { onAuth: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem("admin_auth", "true");
      onAuth();
    } else {
      setError(true);
      setPin("");
    }
  };

  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-ink-200 rounded-lg p-8 w-full max-w-sm shadow-card"
      >
        <h1 className="font-serif text-2xl font-bold text-ink-950 mb-1 text-center">
          Kosher News
        </h1>
        <p className="text-caption text-ink-400 uppercase tracking-widest text-center mb-6">
          Admin Panel
        </p>
        <input
          type="password"
          value={pin}
          onChange={(e) => {
            setPin(e.target.value);
            setError(false);
          }}
          placeholder="Enter admin password"
          className="w-full border border-ink-200 rounded px-3 py-2 text-body-md text-ink-900 focus:outline-none focus:border-ink-400 mb-3"
          autoFocus
        />
        {error && (
          <p className="text-caption text-accent mb-3">
            Incorrect password. Try again.
          </p>
        )}
        <button
          type="submit"
          className="w-full bg-ink-900 text-white py-2 rounded text-body-md font-medium hover:bg-ink-800 transition-colors"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}

// ─── Types ──────────────────────────────────────────────────────
interface Stats {
  totalArticles: number;
  totalRaw: number;
  totalRejected: number;
  totalSources: number;
  activeSources: number;
  breakingCount: number;
  categoryCounts: Record<string, number>;
  last24h: number;
  lastArticleAt: string | null;
}

type Tab = "dashboard" | "articles" | "sources";

// ─── Dashboard Tab ──────────────────────────────────────────────
function DashboardTab({ stats }: { stats: Stats | null }) {
  if (!stats) {
    return (
      <div className="py-12 text-center text-ink-400 text-body-md">
        Loading analytics...
      </div>
    );
  }

  const categoryColors: Record<string, string> = {
    us: "bg-blue-100 text-blue-800",
    israel: "bg-indigo-100 text-indigo-800",
    world: "bg-green-100 text-green-800",
    business: "bg-yellow-100 text-yellow-800",
    tech: "bg-purple-100 text-purple-800",
    health: "bg-pink-100 text-pink-800",
  };

  const lastArticle = stats.lastArticleAt
    ? new Date(stats.lastArticleAt).toLocaleString()
    : "Never";

  return (
    <div>
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Articles" value={stats.totalArticles} />
        <StatCard label="Last 24 Hours" value={stats.last24h} accent />
        <StatCard label="Raw Fetched" value={stats.totalRaw} />
        <StatCard label="Rejected" value={stats.totalRejected} />
        <StatCard label="Breaking News" value={stats.breakingCount} />
        <StatCard
          label="Active Sources"
          value={`${stats.activeSources}/${stats.totalSources}`}
        />
        <div className="col-span-2 bg-white border border-ink-200 rounded-lg p-4">
          <p className="text-caption text-ink-400 uppercase tracking-wider mb-1">
            Last Article
          </p>
          <p className="text-body-md text-ink-800 font-medium">{lastArticle}</p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white border border-ink-200 rounded-lg p-6">
        <h3 className="text-body-md font-semibold text-ink-900 mb-4">
          Articles by Category
        </h3>
        <div className="space-y-3">
          {Object.entries(stats.categoryCounts)
            .sort(([, a], [, b]) => b - a)
            .map(([cat, count]) => {
              const pct = stats.totalArticles
                ? Math.round((count / stats.totalArticles) * 100)
                : 0;
              return (
                <div key={cat} className="flex items-center gap-3">
                  <span
                    className={`text-caption font-semibold px-2 py-0.5 rounded ${categoryColors[cat] || "bg-ink-100 text-ink-600"}`}
                  >
                    {CATEGORY_LABELS[cat] || cat}
                  </span>
                  <div className="flex-1 bg-ink-100 rounded-full h-2">
                    <div
                      className="bg-ink-700 h-2 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-caption text-ink-500 w-16 text-right">
                    {count} ({pct}%)
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="bg-white border border-ink-200 rounded-lg p-4">
      <p className="text-caption text-ink-400 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p
        className={`text-2xl font-bold ${accent ? "text-accent" : "text-ink-900"}`}
      >
        {value}
      </p>
    </div>
  );
}

// ─── Articles Tab ───────────────────────────────────────────────
function ArticlesTab() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);
  const PAGE_SIZE = 20;

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      limit: String(PAGE_SIZE),
      offset: String(page * PAGE_SIZE),
    });
    if (category !== "all") params.set("category", category);
    if (search) params.set("search", search);

    try {
      const res = await fetch(`/api/admin/articles?${params}`);
      const data = await res.json();
      setArticles(data.articles || []);
      setTotal(data.total || 0);
    } catch {
      console.error("Failed to fetch articles");
    } finally {
      setLoading(false);
    }
  }, [page, category, search]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleDelete = async (id: string, headline: string) => {
    if (!confirm(`Delete article?\n\n"${headline}"`)) return;
    setDeleting(id);
    try {
      await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
      setArticles((prev) => prev.filter((a) => a.id !== id));
      setTotal((prev) => prev - 1);
    } catch {
      alert("Failed to delete article");
    } finally {
      setDeleting(null);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Search headlines..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="flex-1 border border-ink-200 rounded px-3 py-2 text-body-md text-ink-900 focus:outline-none focus:border-ink-400"
        />
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(0);
          }}
          className="border border-ink-200 rounded px-3 py-2 text-body-md text-ink-900 focus:outline-none focus:border-ink-400 bg-white"
        >
          <option value="all">All Categories</option>
          {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Count */}
      <p className="text-caption text-ink-400 mb-4">
        {total} article{total !== 1 ? "s" : ""} found
      </p>

      {/* Table */}
      <div className="bg-white border border-ink-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-ink-400 text-body-md">
            Loading...
          </div>
        ) : articles.length === 0 ? (
          <div className="p-8 text-center text-ink-400 text-body-md">
            No articles found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-ink-200 bg-ink-50">
                  <th className="px-4 py-3 text-caption text-ink-500 uppercase tracking-wider font-semibold">
                    Headline
                  </th>
                  <th className="px-4 py-3 text-caption text-ink-500 uppercase tracking-wider font-semibold w-24">
                    Category
                  </th>
                  <th className="px-4 py-3 text-caption text-ink-500 uppercase tracking-wider font-semibold w-20">
                    Sources
                  </th>
                  <th className="px-4 py-3 text-caption text-ink-500 uppercase tracking-wider font-semibold w-36">
                    Date
                  </th>
                  <th className="px-4 py-3 text-caption text-ink-500 uppercase tracking-wider font-semibold w-20">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr
                    key={article.id}
                    className="border-b border-ink-100 hover:bg-ink-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {article.is_breaking && (
                          <span className="shrink-0 w-2 h-2 rounded-full bg-accent" />
                        )}
                        <span className="text-body-sm text-ink-800 line-clamp-2">
                          {article.headline}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-caption text-ink-500">
                        {CATEGORY_LABELS[article.category] || article.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-caption text-ink-400">
                        {article.sources.length}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-caption text-ink-400">
                        {new Date(article.created_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() =>
                          handleDelete(article.id, article.headline)
                        }
                        disabled={deleting === article.id}
                        className="text-caption text-accent hover:text-accent-dark font-medium disabled:opacity-50 transition-colors"
                      >
                        {deleting === article.id ? "..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 border border-ink-200 rounded text-body-sm text-ink-600 hover:bg-ink-50 disabled:opacity-40 transition-colors"
          >
            Previous
          </button>
          <span className="text-caption text-ink-400">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1.5 border border-ink-200 rounded text-body-sm text-ink-600 hover:bg-ink-50 disabled:opacity-40 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Sources Tab ────────────────────────────────────────────────
function SourcesTab() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/sources")
      .then((r) => r.json())
      .then((data) => setSources(data))
      .catch(() => console.error("Failed to fetch sources"))
      .finally(() => setLoading(false));
  }, []);

  const toggleSource = async (id: string, currentActive: boolean) => {
    setToggling(id);
    try {
      await fetch("/api/admin/sources", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !currentActive }),
      });
      setSources((prev) =>
        prev.map((s) => (s.id === id ? { ...s, active: !currentActive } : s))
      );
    } catch {
      alert("Failed to update source");
    } finally {
      setToggling(null);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-ink-400 text-body-md">
        Loading sources...
      </div>
    );
  }

  return (
    <div className="bg-white border border-ink-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-ink-200 bg-ink-50">
              <th className="px-4 py-3 text-caption text-ink-500 uppercase tracking-wider font-semibold">
                Source
              </th>
              <th className="px-4 py-3 text-caption text-ink-500 uppercase tracking-wider font-semibold w-24">
                Region
              </th>
              <th className="px-4 py-3 text-caption text-ink-500 uppercase tracking-wider font-semibold w-24">
                Category
              </th>
              <th className="px-4 py-3 text-caption text-ink-500 uppercase tracking-wider font-semibold w-20">
                Errors
              </th>
              <th className="px-4 py-3 text-caption text-ink-500 uppercase tracking-wider font-semibold w-36">
                Last Fetched
              </th>
              <th className="px-4 py-3 text-caption text-ink-500 uppercase tracking-wider font-semibold w-20">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {sources.map((source) => (
              <tr
                key={source.id}
                className="border-b border-ink-100 hover:bg-ink-50 transition-colors"
              >
                <td className="px-4 py-3">
                  <div>
                    <p className="text-body-sm text-ink-800 font-medium">
                      {source.name}
                    </p>
                    <p className="text-caption text-ink-400 truncate max-w-xs">
                      {source.feed_url}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-caption text-ink-500 capitalize">
                    {source.region}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-caption text-ink-500 capitalize">
                    {source.category_hint}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-caption font-medium ${source.error_count > 0 ? "text-accent" : "text-ink-400"}`}
                  >
                    {source.error_count}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-caption text-ink-400">
                    {source.last_fetched_at
                      ? new Date(source.last_fetched_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          }
                        )
                      : "Never"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleSource(source.id, source.active)}
                    disabled={toggling === source.id}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
                      source.active ? "bg-green-500" : "bg-ink-300"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200 ${
                        source.active ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Admin Page ────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem("admin_auth") === "true") {
      setAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (!authed) return;
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => console.error("Failed to fetch stats"));
  }, [authed]);

  if (!authed) {
    return <LoginGate onAuth={() => setAuthed(true)} />;
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "dashboard", label: "Dashboard" },
    { id: "articles", label: "Articles" },
    { id: "sources", label: "Sources" },
  ];

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Header */}
      <header className="bg-white border-b border-ink-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="font-serif text-xl font-bold text-ink-950 hover:text-ink-700 transition-colors"
            >
              Kosher News
            </a>
            <span className="text-caption bg-ink-900 text-white px-2 py-0.5 rounded font-medium uppercase tracking-wider">
              Admin
            </span>
          </div>
          <button
            onClick={() => {
              sessionStorage.removeItem("admin_auth");
              setAuthed(false);
            }}
            className="text-body-sm text-ink-500 hover:text-ink-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-ink-200">
        <div className="max-w-6xl mx-auto px-6">
          <nav className="flex gap-6">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`py-3 text-body-md font-medium border-b-2 transition-colors ${
                  tab === t.id
                    ? "border-ink-900 text-ink-900"
                    : "border-transparent text-ink-400 hover:text-ink-600"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {tab === "dashboard" && <DashboardTab stats={stats} />}
        {tab === "articles" && <ArticlesTab />}
        {tab === "sources" && <SourcesTab />}
      </div>
    </div>
  );
}
