/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SearchIcon, ArrowRightIcon, ScanSearchIcon, ZapIcon, TargetIcon, TrendingUpIcon, TrendingDownIcon, MinusIcon, SparklesIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import AnalysesCard from "../components/AnalysesCard";
import { useUser } from "../context/UserContext";

interface AnalysisSummary {
    _id: string;
    url: string;
    overallScore: number;
    status: string;
    createdAt: string;
    categories: {
        seo: number;
        performance: number;
        accessibility: number;
        bestPractices: number;
    };
}

interface KeywordSummary {
    _id: string;
    keyword: string;
    domain: string;
    currentPosition: number | null;
    positionChange: number;
    status: string;
}

interface CronRunStatus {
    status: "running" | "completed" | "failed";
    startedAt: string;
    finishedAt: string | null;
    totalKeywords: number;
    checked: number;
    failed: number;
    error: string | null;
}

const KEYWORD_SLOTS = 4;
const ACCENT_BAR = { background: "linear-gradient(90deg, #9333EA, #C084FC)" };

const timeAgo = (dateStr: string) => {
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
};

function SectionHeader({ icon, eyebrow, title, viewAllTo, showViewAll }: { icon: React.ReactNode; eyebrow: string; title: string; viewAllTo: string; showViewAll: boolean }) {
    return (
        <div className="flex items-end justify-between gap-4 mb-6 sm:mb-7">
            <div>
                <div className="h-[3px] w-10 rounded-full mb-3" style={ACCENT_BAR} />
                <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 rounded-md bg-purple-accent/10 flex items-center justify-center text-purple-accent shrink-0">{icon}</div>
                    <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-purple-accent">{eyebrow}</p>
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">{title}</h2>
            </div>
            {showViewAll && (
                <Link to={viewAllTo} className="text-sm text-primary hover:underline flex items-center gap-1 shrink-0 pb-1">
                    View All <ArrowRightIcon size={14} />
                </Link>
            )}
        </div>
    );
}

export default function Dashboard() {
    const { api, user } = useUser();
    const navigate = useNavigate();
    const [url, setUrl] = useState("");
    const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
    const [totalScans, setTotalScans] = useState(0);
    const [loading, setLoading] = useState(true);
    const [keywords, setKeywords] = useState<KeywordSummary[]>([]);
    const [keywordsLoading, setKeywordsLoading] = useState(true);
    const [cronRun, setCronRun] = useState<CronRunStatus | null>(null);

    const fetchRecent = async () => {
        try {
            const res = await api.get("/analysis/list?limit=6");
            if (res.data.success) {
                setAnalyses(res.data.analyses);
                setTotalScans(res.data.pagination.total);
            }
        } catch (error) {
            console.error("Failed to fetch analyses", error);
            toast.error("Failed to load recent analyses");
        }
        setLoading(false);
    };

    const fetchKeywords = async () => {
        try {
            const res = await api.get("/rank/list");
            if (res.data.success) {
                setKeywords(res.data.keywords.slice(0, KEYWORD_SLOTS));
            }
        } catch (error) {
            console.error("Failed to fetch keywords", error);
            toast.error("Failed to load tracked keywords");
        }
        setKeywordsLoading(false);
    };

    const fetchCronStatus = async () => {
        try {
            const res = await api.get("/rank/cron-status");
            if (res.data.success) setCronRun(res.data.run);
        } catch (error) {
            console.error("Failed to fetch cron status", error);
        }
    };

    const handleAnalyze = (e: React.SubmitEvent) => {
        e.preventDefault();
        if (url.trim()) {
            navigate(`/analyze?url=${encodeURIComponent(url)}`);
        }
    };

    const getTrend = (change: number) => {
        if (change > 0) return { icon: <TrendingUpIcon size={13} />, text: `+${change}`, className: "text-[var(--success)]" };
        if (change < 0) return { icon: <TrendingDownIcon size={13} />, text: `${change}`, className: "text-danger" };
        return { icon: <MinusIcon size={13} />, text: "0", className: "text-muted-foreground" };
    };

    useEffect(() => {
        (async () => await fetchRecent())();
        (async () => await fetchKeywords())();
        (async () => await fetchCronStatus())();
    }, []);

    const keywordCardWidth = "w-full sm:w-[calc(50%-8px)] lg:w-[240px]";
    const analysisCardWidth = "w-full sm:w-[calc(50%-8px)] lg:w-[300px]";

    return (
        <div className="dashboard-mesh-bg min-h-screen pt-28 md:pt-36 overflow-hidden">
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-16 sm:space-y-20">
                {/* Hero + Stats + Quick Analyze — unified tinted zone */}
                <section className="dash-zone dash-zone-tinted">
                    <div className="h-[3px] w-10 rounded-full mb-3" style={ACCENT_BAR} />
                    <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-6 h-6 rounded-md bg-purple-accent/10 flex items-center justify-center text-purple-accent shrink-0">
                            <SparklesIcon size={13} />
                        </div>
                        <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-purple-accent">Dashboard Overview</p>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
                        <div>
                            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground leading-none mb-2">
                                Welcome back,{" "}
                                <span
                                    style={{
                                        background: "linear-gradient(135deg, #9333EA, #A78BFA)",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        backgroundClip: "text",
                                    }}
                                >
                                    {user?.name}
                                </span>
                            </h1>
                            <p className="text-muted-foreground text-sm">Analyze websites and boost your SEO performance.</p>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                            <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm px-4 py-3">
                                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <ScanSearchIcon size={16} />
                                </div>
                                <div>
                                    <p className="font-display text-xl font-bold text-foreground leading-none">{totalScans}</p>
                                    <p className="text-[10.5px] text-muted-foreground mt-0.5 whitespace-nowrap">Total Scans</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm px-4 py-3">
                                <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                                    <ZapIcon size={16} />
                                </div>
                                <div>
                                    <p className="font-display text-xl font-bold text-foreground leading-none">{user?.plan === "free" ? `${5 - (user?.analysisCount || 0)}` : "∞"}</p>
                                    <p className="text-[10.5px] text-muted-foreground mt-0.5 whitespace-nowrap">Scans Left Today</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleAnalyze} className="mt-8 pt-8 border-t border-border/50">
                        <div className="border border-primary/20 rounded-full p-2 flex items-center gap-2 max-w-2xl bg-background/50">
                            <div className="flex items-center gap-3 flex-1 px-3">
                                <SearchIcon size={20} className="text-muted-foreground shrink-0" />
                                <input
                                    type="text"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="Enter a URL to analyze..."
                                    className="w-full bg-transparent text-foreground placeholder-muted-foreground outline-none text-sm py-3"
                                    id="dashboard-url-input"
                                />
                            </div>
                            <button type="submit" className="bg-primary px-5 py-3 rounded-full text-primary-foreground text-sm hover:opacity-90 transition-opacity shrink-0 flex items-center gap-2" style={{ color: "var(--background)" }} id="dashboard-analyze-btn">
                                Analyze
                                <ArrowRightIcon size={16} />
                            </button>
                        </div>
                    </form>
                </section>

                {/* Top Tracked Keywords — plain zone, alternating with the tinted ones */}
                <section className="dash-zone">
                    <SectionHeader icon={<TargetIcon size={13} />} eyebrow="Keyword Tracking" title="Top Tracked Keywords" viewAllTo="/rank-tracker" showViewAll={keywords.length > 0} />

                    {cronRun && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-5 -mt-1">
                            <span
                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                    cronRun.status === "running" ? "bg-purple-accent animate-pulse" : cronRun.status === "failed" ? "bg-danger" : cronRun.failed > 0 ? "bg-warning" : "bg-success"
                                }`}
                            />
                            {cronRun.status === "running" ? (
                                "Syncing rankings now…"
                            ) : cronRun.status === "failed" ? (
                                <>Rank sync failed {timeAgo(cronRun.finishedAt || cronRun.startedAt)}</>
                            ) : (
                                <>
                                    Rankings synced {timeAgo(cronRun.finishedAt || cronRun.startedAt)} · {cronRun.checked} checked
                                    {cronRun.failed > 0 && <span className="text-warning"> · {cronRun.failed} failed</span>}
                                </>
                            )}
                        </div>
                    )}

                    {keywordsLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="size-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : keywords.length === 0 ? (
                        <div className="rounded-3xl border border-border/60 bg-card/50 backdrop-blur-sm p-10 text-center">
                            <TargetIcon size={40} className="mx-auto text-muted-foreground mb-4 opacity-50" />
                            <h3 className="text-base font-semibold text-foreground mb-1.5">No keywords tracked yet</h3>
                            <p className="text-sm text-muted-foreground mb-5">Track a keyword to see your Google rankings here.</p>
                            <Link to="/rank-tracker" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                                Track a keyword <ArrowRightIcon size={14} />
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-4">
                            {keywords.map((k) => {
                                const trend = getTrend(k.positionChange || 0);
                                return (
                                    <Link
                                        key={k._id}
                                        to={`/rank/${k._id}`}
                                        className={`group relative block ${keywordCardWidth} rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm p-5 overflow-hidden transition-all duration-300 hover:border-purple-accent/40 hover:-translate-y-0.5 hover:shadow-[0_10px_35px_rgba(147,51,234,0.14)]`}
                                    >
                                        <div className="absolute -right-10 -top-10 w-28 h-28 rounded-full bg-purple-accent/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                        <div className="relative flex items-start justify-between gap-3 mb-4">
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-foreground truncate group-hover:text-purple-accent transition-colors">{k.keyword}</p>
                                                <p className="text-xs text-muted-foreground truncate mt-0.5">{k.domain}</p>
                                            </div>
                                            <div className="w-11 h-11 rounded-xl bg-purple-accent/10 border border-purple-accent/20 flex items-center justify-center shrink-0">
                                                <span className="font-display text-sm font-bold text-purple-accent">{k.currentPosition ? `#${k.currentPosition}` : "—"}</span>
                                            </div>
                                        </div>
                                        <div className={`relative flex items-center gap-1 text-xs font-medium ${trend.className}`}>
                                            {trend.icon}
                                            {trend.text} this week
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* Recent Analyses — tinted zone again */}
                <section className="dash-zone dash-zone-tinted">
                    <SectionHeader icon={<ScanSearchIcon size={13} />} eyebrow="Website Audits" title="Recent Analyses" viewAllTo="/history" showViewAll={analyses.length > 0} />

                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="size-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : analyses.length === 0 ? (
                        <div className="rounded-3xl border border-border/60 bg-card/50 backdrop-blur-sm p-12 text-center">
                            <SearchIcon size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">No analyses yet</h3>
                            <p className="text-sm text-muted-foreground mb-6">Enter a URL above to run your first SEO analysis.</p>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-4">
                            {analyses.map((a) => (
                                <AnalysesCard key={a._id} analysis={a} className={analysisCardWidth} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
