/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ScoreGauge from "../components/ScoreGauge";
import IssueCard from "../components/IssueCard";
import { ArrowLeft, Globe, Clock, FileText, Image, Link2, Heading, Tag, AlertCircle, ExternalLink, Type, Search, HardDrive, AlignLeft } from "lucide-react";
import { useUser } from "../context/UserContext";

interface AnalysisData {
    _id: string;
    url: string;
    overallScore: number;
    status: string;
    createdAt: string;
    loadTime: number;
    pageSize: number;
    wordCount: number;
    categories: {
        seo: number;
        performance: number;
        accessibility: number;
        bestPractices: number;
    };
    metaData: {
        title: string;
        description: string;
        canonical: string;
        robots: string;
        ogTitle: string;
        ogDescription: string;
        ogImage: string;
        twitterCard: string;
        viewport: string;
        charset: string;
    };
    headings: {
        h1: number;
        h2: number;
        h3: number;
        h4: number;
        h5: number;
        h6: number;
        h1Texts: string[];
    };
    links: {
        internal: number;
        external: number;
        total: number;
    };
    images: {
        total: number;
        missingAlt: number;
        withAlt: number;
    };
    keywords: { word: string; count: number; density: number }[];
    issues: { severity: string; category: string; message: string; recommendation: string }[];
}

const scoreColor = (s: number) => {
    if (s >= 80) return "var(--ring-success)";
    if (s >= 50) return "var(--ring-warning)";
    return "var(--ring-danger)";
};

const HEADING_TAGS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
const HEADING_ALPHAS = [1, 0.85, 0.7, 0.55, 0.42, 0.3];

function CategoryStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
    const color = scoreColor(value);
    return (
        <div className="flex flex-col items-center sm:items-start gap-1.5 sm:flex-1 sm:px-4 sm:first:pl-0 sm:last:pr-0">
            <div className="flex items-center gap-1.5 text-muted-foreground">
                {icon}
                <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
            </div>
            <span className="font-display text-3xl sm:text-4xl font-bold leading-none" style={{ color }}>
                {value}
            </span>
            <div className="w-full h-[3px] rounded-full bg-muted/50 overflow-hidden mt-1">
                <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${value}%`, background: color }} />
            </div>
        </div>
    );
}

function MetricInline({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
    return (
        <div className="flex items-center gap-1.5 sm:px-3 sm:py-1.5">
            {icon}
            <span className="font-semibold text-foreground">{value}</span>
            <span className="text-muted-foreground">{label}</span>
        </div>
    );
}

function StatInline({ icon, value, label, color }: { icon: React.ReactNode; value: number; label: string; color?: string }) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{icon}</span>
            <span className="font-display text-lg font-bold" style={{ color: color || "var(--foreground)" }}>
                {value}
            </span>
            <span className="text-xs text-muted-foreground">{label}</span>
        </div>
    );
}

const gradientBorder = {
    border: "1px solid transparent",
    backgroundImage: "var(--zone-tint), linear-gradient(var(--card), var(--card)), linear-gradient(135deg, rgba(147,51,234,0.45), rgba(167,139,250,0.1))",
    backgroundOrigin: "padding-box, padding-box, border-box" as const,
    backgroundClip: "padding-box, padding-box, border-box" as const,
};

export default function Report() {
    const { api } = useUser();
    const { id } = useParams();
    const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("overview");

    const fetchAnalysis = async () => {
        try {
            const res = await api.get(`/analysis/${id}`);
            if (res.data.success) {
                if (res.data.analysis.status === "processing") {
                    //poll for completion
                    setTimeout(fetchAnalysis, 2000);
                    return;
                }
                setAnalysis(res.data.analysis);
            } else {
                setError("Analysis not found");
            }
        } catch {
            setError("Failed to load analysis");
        }
        setLoading(false);
    };

    const tabs = [
        { id: "overview", label: "Overview" },
        { id: "meta", label: "Meta Tags" },
        { id: "content", label: "Content" },
        { id: "issues", label: "Issues" },
    ];

    useEffect(() => {
        (async () => await fetchAnalysis())();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="size-7 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground text-sm">Loading report...</p>
                </div>
            </div>
        );
    }

    if (error || !analysis) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center bg-card border border-border rounded-2xl p-10">
                    <AlertCircle size={48} className="mx-auto text-danger mb-4" />
                    <h2 className="text-xl font-bold text-foreground mb-2">Report Not Found</h2>
                    <p className="text-muted-foreground text-sm mb-6">{error || "This analysis doesn't exist."}</p>
                    <Link to="/dashboard" className="bg-primary px-5 py-2.5 rounded-xl text-sm font-semibold text-primary-foreground inline-block" style={{ color: "var(--background)" }}>
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    if (analysis.status === "failed") {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center bg-card border border-border rounded-2xl p-10">
                    <AlertCircle size={48} className="mx-auto text-danger mb-4" />
                    <h2 className="text-xl font-bold text-foreground mb-2">Analysis Failed</h2>
                    <p className="text-muted-foreground text-sm mb-6">The AI model might be down. Please try again later.</p>
                    <Link to="/analyze" className="bg-primary px-5 py-2.5 rounded-xl text-sm font-semibold text-primary-foreground inline-block" style={{ color: "var(--background)" }}>
                        Try Again
                    </Link>
                </div>
            </div>
        );
    }

    const criticalCount = analysis.issues.filter((i) => i.severity === "critical").length;
    const warningCount = analysis.issues.filter((i) => i.severity === "warning").length;
    const infoCount = analysis.issues.filter((i) => i.severity === "info").length;
    const totalIssues = criticalCount + warningCount + infoCount || 1;

    const maxHeadingCount = Math.max(...HEADING_TAGS.map((t) => analysis.headings[t]), 1);
    const sortedKeywords = [...analysis.keywords].sort((a, b) => b.count - a.count);
    const maxKeywordCount = Math.max(...sortedKeywords.map((k) => k.count), 1);

    const heroColor = scoreColor(analysis.overallScore);

    return (
        <div className="min-h-screen pt-16 md:pt-24 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Back + Header */}
                <div className="mb-8">
                    <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                        <ArrowLeft size={16} />
                        Back to Dashboard
                    </Link>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl font-medium text-foreground truncate">{new URL(analysis.url).hostname}</h1>
                            <div className="flex items-center gap-3 mt-1">
                                <a href={analysis.url} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary truncate flex items-center gap-1 transition-colors">
                                    {analysis.url}
                                    <ExternalLink size={12} />
                                </a>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(analysis.createdAt).toLocaleDateString()} at {new Date(analysis.createdAt).toLocaleTimeString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Score Hero — primary section: glow + gradient border */}
                <div className="relative rounded-[2rem] p-6 sm:p-10 mb-8 overflow-hidden" style={gradientBorder}>
                    <div className="pointer-events-none absolute -top-24 -left-16 w-72 h-72 rounded-full blur-3xl opacity-20" style={{ background: heroColor }} />

                    <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
                        <ScoreGauge score={analysis.overallScore} size={180} strokeWidth={14} label="Overall Score" glow />

                        <div className="flex-1 w-full">
                            {/* Category stat strip */}
                            <div className="grid grid-cols-2 gap-y-6 sm:flex sm:flex-nowrap sm:divide-x sm:divide-border/40 items-stretch justify-between pb-6 mb-6 border-b border-border/40">
                                <CategoryStat label="SEO" value={analysis.categories.seo} icon={<Search size={13} />} />
                                <CategoryStat label="Performance" value={analysis.categories.performance} icon={<Clock size={13} />} />
                                <CategoryStat label="Accessibility" value={analysis.categories.accessibility} icon={<Globe size={13} />} />
                                <CategoryStat label="Best Practices" value={analysis.categories.bestPractices} icon={<Tag size={13} />} />
                            </div>

                            {/* Secondary metrics — single thin stat bar */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 sm:flex-nowrap sm:gap-0 sm:divide-x sm:divide-border/50 rounded-2xl sm:rounded-full border border-border/50 bg-muted/20 text-xs w-fit px-3 py-1.5 sm:px-0 sm:py-0">
                                <MetricInline icon={<Clock size={12} className="text-muted-foreground" />} value={`${analysis.loadTime}ms`} label="Load Time" />
                                <MetricInline icon={<HardDrive size={12} className="text-muted-foreground" />} value={`${Math.round(analysis.pageSize / 1024)}KB`} label="Page Size" />
                                <MetricInline icon={<AlignLeft size={12} className="text-muted-foreground" />} value={analysis.wordCount.toLocaleString()} label="Words" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-8 overflow-x-auto pb-1">
                    {tabs.map((tab) => {
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${active ? "text-white shadow-[0_8px_20px_rgba(147,51,234,0.35)]" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
                                style={active ? { background: "linear-gradient(135deg, var(--purple-soft), var(--purple-accent))" } : undefined}
                            >
                                {tab.label}
                                {tab.id === "issues" && analysis.issues.length > 0 && <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${active ? "bg-white/20" : "bg-danger/20 text-danger"}`}>{analysis.issues.length}</span>}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div key={activeTab}>
                    {activeTab === "overview" && (
                        <div className="space-y-8">
                            {/* Issues Summary — primary section, full width */}
                            <div className="rounded-[1.75rem] p-6 sm:p-8 dash-zone-tinted" style={{ border: "1px solid var(--zone-tint-border)" }}>
                                <h3 className="text-lg font-semibold text-foreground mb-5 flex items-center gap-2">
                                    <AlertCircle size={20} style={{ color: "var(--ring-danger)" }} />
                                    Issues Summary
                                </h3>

                                {/* Stacked severity bar */}
                                <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted/40">
                                    {criticalCount > 0 && <div className="h-full transition-all duration-700" style={{ width: `${(criticalCount / totalIssues) * 100}%`, background: "var(--ring-danger)" }} />}
                                    {warningCount > 0 && <div className="h-full transition-all duration-700" style={{ width: `${(warningCount / totalIssues) * 100}%`, background: "var(--ring-warning)" }} />}
                                    {infoCount > 0 && <div className="h-full transition-all duration-700" style={{ width: `${(infoCount / totalIssues) * 100}%`, background: "var(--accent)" }} />}
                                </div>
                                <div className="flex items-center gap-5 mt-3 mb-5 text-xs flex-wrap">
                                    <span className="flex items-center gap-1.5 text-muted-foreground">
                                        <span className="w-2 h-2 rounded-full" style={{ background: "var(--ring-danger)" }} />
                                        <span className="font-semibold text-foreground">{criticalCount}</span> Critical
                                    </span>
                                    <span className="flex items-center gap-1.5 text-muted-foreground">
                                        <span className="w-2 h-2 rounded-full" style={{ background: "var(--ring-warning)" }} />
                                        <span className="font-semibold text-foreground">{warningCount}</span> Warning
                                    </span>
                                    <span className="flex items-center gap-1.5 text-muted-foreground">
                                        <span className="w-2 h-2 rounded-full" style={{ background: "var(--accent)" }} />
                                        <span className="font-semibold text-foreground">{infoCount}</span> Info
                                    </span>
                                </div>

                                {analysis.issues.length > 0 && (
                                    <div className="divide-y divide-border/30">
                                        {analysis.issues.slice(0, 3).map((issue, i) => (
                                            <IssueCard key={i} issue={issue} />
                                        ))}
                                        {analysis.issues.length > 3 && (
                                            <button onClick={() => setActiveTab("issues")} className="w-full text-center text-sm text-primary hover:underline py-3">
                                                View all {analysis.issues.length} issues →
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Headings + Keywords — secondary charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                <div className="rounded-xl border border-border/40 bg-muted/10 p-5 sm:p-6">
                                    <h3 className="text-sm font-semibold text-muted-foreground mb-5 flex items-center gap-2 uppercase tracking-wide">
                                        <Heading size={14} />
                                        Heading Structure
                                    </h3>
                                    <div className="space-y-3">
                                        {HEADING_TAGS.map((tag, i) => {
                                            const count = analysis.headings[tag];
                                            const pct = (count / maxHeadingCount) * 100;
                                            return (
                                                <div key={tag} className="flex items-center gap-3">
                                                    <span className="text-xs font-mono text-muted-foreground w-6 uppercase">{tag}</span>
                                                    <div className="relative flex-1 h-6">
                                                        <div className="absolute inset-0 rounded-md bg-muted/40" />
                                                        <div className="absolute inset-y-0 left-0 rounded-md transition-all duration-700" style={{ width: `${pct}%`, background: `rgba(147,51,234,${HEADING_ALPHAS[i]})` }} />
                                                        <span className={`absolute inset-y-0 flex items-center text-xs font-bold ${tag === "h1" && count !== 1 ? "text-danger" : "text-foreground"}`} style={{ left: `calc(${pct}% + 8px)` }}>
                                                            {count}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {analysis.headings.h1Texts.length > 0 && (
                                        <div className="mt-5 pt-4 border-t border-border/30">
                                            <p className="text-xs text-muted-foreground mb-1">H1 Text:</p>
                                            {analysis.headings.h1Texts.map((text, i) => (
                                                <p key={i} className="text-sm text-foreground/80 truncate">
                                                    {text}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="rounded-xl border border-border/40 bg-muted/10 p-5 sm:p-6">
                                    <h3 className="text-sm font-semibold text-muted-foreground mb-5 flex items-center gap-2 uppercase tracking-wide">
                                        <Type size={14} />
                                        Top Keywords
                                    </h3>
                                    {sortedKeywords.length > 0 ? (
                                        <div className="space-y-0.5">
                                            {sortedKeywords.map((kw, i) => (
                                                <div key={kw.word} className="group flex items-center gap-3 rounded-lg px-2 py-1.5 -mx-2 transition-colors hover:bg-muted/40">
                                                    <span className="text-xs font-mono text-muted-foreground w-4 text-right shrink-0">{i + 1}</span>
                                                    <span className="text-sm font-medium text-foreground w-24 sm:w-28 truncate shrink-0">{kw.word}</span>
                                                    <div className="flex-1 h-2.5 rounded-full bg-muted/40 overflow-hidden">
                                                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(kw.count / maxKeywordCount) * 100}%`, background: "linear-gradient(90deg, var(--purple-soft), var(--purple-accent))" }} />
                                                    </div>
                                                    <span className="text-[11px] text-muted-foreground w-16 text-right shrink-0 font-mono">
                                                        {kw.count}× · {kw.density}%
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No keyword data available.</p>
                                    )}
                                </div>
                            </div>

                            {/* Links & Images — most demoted, single quiet stat-row */}
                            <div className="rounded-xl border border-border/30 bg-muted/5 px-5 sm:px-6 py-4">
                                <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                                    <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5 shrink-0">
                                        <Link2 size={13} />
                                        Links & Images
                                    </span>
                                    <StatInline icon={<Link2 size={13} />} value={analysis.links.internal} label="Internal" />
                                    <StatInline icon={<ExternalLink size={13} />} value={analysis.links.external} label="External" />
                                    <StatInline icon={<Link2 size={13} />} value={analysis.links.total} label="Total Links" />
                                    <div className="w-px h-6 bg-border/50 hidden sm:block" />
                                    <StatInline icon={<Image size={13} />} value={analysis.images.total} label="Images" />
                                    <StatInline icon={<Image size={13} />} value={analysis.images.withAlt} label="With Alt" color="var(--ring-success)" />
                                    <StatInline icon={<AlertCircle size={13} />} value={analysis.images.missingAlt} label="Missing Alt" color={analysis.images.missingAlt > 0 ? "var(--ring-danger)" : "var(--ring-success)"} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "meta" && (
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                                <FileText size={20} className="text-primary" />
                                Meta Tags Analysis
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { label: "Title", value: analysis.metaData.title, ideal: "50-60 characters", len: analysis.metaData.title.length },
                                    { label: "Description", value: analysis.metaData.description, ideal: "150-160 characters", len: analysis.metaData.description.length },
                                    { label: "Canonical URL", value: analysis.metaData.canonical },
                                    { label: "Robots", value: analysis.metaData.robots },
                                    { label: "Viewport", value: analysis.metaData.viewport },
                                    { label: "Charset", value: analysis.metaData.charset },
                                    { label: "OG Title", value: analysis.metaData.ogTitle },
                                    { label: "OG Description", value: analysis.metaData.ogDescription },
                                    { label: "OG Image", value: analysis.metaData.ogImage },
                                    { label: "Twitter Card", value: analysis.metaData.twitterCard },
                                ].map((meta) => (
                                    <div key={meta.label} className="bg-muted/50 border border-border rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium text-foreground">{meta.label}</span>
                                            <div className="flex items-center gap-2">
                                                {meta.len !== undefined && <span className="text-xs text-muted-foreground">{meta.len} chars</span>}
                                                {meta.value ? <span className="w-2 h-2 rounded-full bg-success" /> : <span className="w-2 h-2 rounded-full bg-danger" />}
                                            </div>
                                        </div>
                                        {meta.value ? <p className="text-sm text-muted-foreground break-all">{meta.value}</p> : <p className="text-sm text-danger/60 italic">Missing</p>}
                                        {meta.ideal && <p className="text-[10px] text-gray-600 mt-1">Ideal: {meta.ideal}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "content" && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-card border border-border rounded-2xl p-6">
                                <h3 className="text-lg font-semibold text-foreground mb-4">Content Stats</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-muted/50 border border-border rounded-xl">
                                        <span className="text-sm text-muted-foreground">Word Count</span>
                                        <span className="font-bold text-foreground">{analysis.wordCount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-muted/50 border border-border rounded-xl">
                                        <span className="text-sm text-muted-foreground">Page Size</span>
                                        <span className="font-bold text-foreground">{Math.round(analysis.pageSize / 1024)} KB</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-muted/50 border border-border rounded-xl">
                                        <span className="text-sm text-muted-foreground">Load Time</span>
                                        <span className={`font-bold ${analysis.loadTime < 3000 ? "score-good" : analysis.loadTime < 5000 ? "score-medium" : "score-poor"}`}>{(analysis.loadTime / 1000).toFixed(2)}s</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-muted/50 border border-border rounded-xl">
                                        <span className="text-sm text-muted-foreground">Total Links</span>
                                        <span className="font-bold text-foreground">{analysis.links.total}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-muted/50 border border-border rounded-xl">
                                        <span className="text-sm text-muted-foreground">Total Images</span>
                                        <span className="font-bold text-foreground">{analysis.images.total}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-muted/50 border border-border rounded-xl">
                                        <span className="text-sm text-muted-foreground">Total Headings</span>
                                        <span className="font-bold text-foreground">{analysis.headings.h1 + analysis.headings.h2 + analysis.headings.h3 + analysis.headings.h4 + analysis.headings.h5 + analysis.headings.h6}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card border border-border rounded-2xl p-6">
                                <h3 className="text-lg font-semibold text-foreground mb-4">Heading Hierarchy</h3>
                                <div className="space-y-2">
                                    {HEADING_TAGS.map((tag, i) => {
                                        const count = analysis.headings[tag];
                                        return (
                                            <div key={tag} className="flex items-center gap-3 p-2.5 bg-muted/30 border border-border rounded-lg" style={{ paddingLeft: `${i * 12 + 12}px` }}>
                                                <span className="text-xs font-mono font-bold text-primary uppercase">&lt;{tag}&gt;</span>
                                                <span className="text-sm text-muted-foreground flex-1">
                                                    {count} {count === 1 ? "tag" : "tags"}
                                                </span>
                                                {tag === "h1" && <span className={`text-xs px-2 py-0.5 rounded-full ${count === 1 ? "score-bg-good text-success" : "score-bg-poor text-danger"}`}>{count === 1 ? "✓ Good" : count === 0 ? "✗ Missing" : "✗ Multiple"}</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "issues" && (
                        <div>
                            {analysis.issues.length > 0 ? (
                                <>
                                    {/* Issue filters */}
                                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                                        <span className="text-sm text-muted-foreground">Filter:</span>
                                        <span className="severity-critical px-2.5 py-1 rounded-full text-xs font-semibold">{criticalCount} Critical</span>
                                        <span className="severity-warning px-2.5 py-1 rounded-full text-xs font-semibold">{warningCount} Warnings</span>
                                        <span className="severity-info px-2.5 py-1 rounded-full text-xs font-semibold">{infoCount} Info</span>
                                    </div>
                                    <div className="rounded-xl border border-border/40 bg-muted/10 divide-y divide-border/30">
                                        {analysis.issues.map((issue, i) => (
                                            <IssueCard key={i} issue={issue} />
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="bg-card border border-border rounded-2xl p-12 text-center">
                                    <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                                        <AlertCircle size={32} className="text-success" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">No Issues Found!</h3>
                                    <p className="text-sm text-muted-foreground">Your website is following SEO best practices.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
