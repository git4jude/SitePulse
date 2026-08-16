/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Clock, Trash2, ExternalLink, Search, AlertCircle, Loader2, Filter, ArrowUpDown, ScanSearchIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import ScoreGauge from "../components/ScoreGauge";
import ConfirmDialog from "../components/ConfirmDialog";
import { useUser } from "../context/UserContext";

interface AnalysisItem {
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

const ACCENT_BAR = { background: "linear-gradient(90deg, #9333EA, #C084FC)" };

const scoreColor = (s: number) => {
    if (s >= 80) return "var(--ring-success)";
    if (s >= 50) return "var(--ring-warning)";
    return "var(--ring-danger)";
};

export default function History() {
    const { api } = useUser();

    const [analyses, setAnalyses] = useState<AnalysisItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest");

    const fetchAnalyses = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/analysis/list?page=${page}&limit=12`);
            if (res.data.success) {
                setAnalyses(res.data.analyses);
                setTotalPages(res.data.pagination.pages);
            }
        } catch (error) {
            console.error("Failed to fetch analyses", error);
            toast.error("Failed to load analysis history");
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        setDeleting(id);
        try {
            await api.delete(`/analysis/${id}`);
            setAnalyses((prev) => prev.filter((a) => a._id !== id));
            toast.success("Analysis deleted");
        } catch (error) {
            console.error("Failed to delete analysis", error);
            toast.error("Failed to delete analysis");
        }
        setDeleting(null);
    };

    let processedData = [...analyses];

    if (searchQuery) {
        processedData = processedData.filter((a) => a.url.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (statusFilter !== "all") {
        processedData = processedData.filter((a) => a.status === statusFilter);
    }

    processedData.sort((a, b) => {
        if (sortBy === "newest") {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else if (sortBy === "oldest") {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        } else if (sortBy === "score_high") {
            return b.overallScore - a.overallScore;
        } else if (sortBy === "score_low") {
            return a.overallScore - b.overallScore;
        }
        return 0;
    });

    useEffect(() => {
        (async () => await fetchAnalyses())();
    }, [page]);

    return (
        <div className="dashboard-mesh-bg min-h-screen pt-16 md:pt-24 overflow-hidden">
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                    <div>
                        <div className="h-[3px] w-10 rounded-full mb-3" style={ACCENT_BAR} />
                        <div className="flex items-center gap-2 mb-1.5">
                            <div className="w-6 h-6 rounded-md bg-purple-accent/10 flex items-center justify-center text-purple-accent shrink-0">
                                <ScanSearchIcon size={13} />
                            </div>
                            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-purple-accent">Website Audits</p>
                        </div>
                        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Analysis History</h1>
                        <p className="text-muted-foreground text-sm mt-1">View and manage all your past SEO analyses.</p>
                    </div>
                    <Link
                        to="/analyze"
                        className="bg-primary px-5 py-2.5 rounded-xl text-sm font-semibold text-primary-foreground self-start hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        style={{ color: "var(--background)" }}
                    >
                        New Analysis
                    </Link>
                </div>

                {/* Filters Row */}
                <div className="mb-6 flex flex-col md:flex-row gap-3">
                    <div className="rounded-xl border border-border/50 bg-muted/10 px-4 py-2.5 flex items-center gap-2 flex-1 transition-colors focus-within:border-purple-accent/40">
                        <Search size={18} className="text-muted-foreground" />
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by URL..." className="bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none flex-1" id="history-search-input" />
                    </div>

                    <div className="flex gap-3">
                        <div className="rounded-xl border border-border/50 bg-muted/10 px-4 py-2.5 flex items-center gap-2">
                            <Filter size={16} className="text-muted-foreground" />
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-transparent text-sm text-foreground outline-none appearance-none pr-4 cursor-pointer">
                                <option value="all" className="bg-background">
                                    All Status
                                </option>
                                <option value="completed" className="bg-background">
                                    Completed
                                </option>
                                <option value="processing" className="bg-background">
                                    Processing
                                </option>
                                <option value="failed" className="bg-background">
                                    Failed
                                </option>
                            </select>
                        </div>
                        <div className="rounded-xl border border-border/50 bg-muted/10 px-4 py-2.5 flex items-center gap-2">
                            <ArrowUpDown size={16} className="text-muted-foreground" />
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent text-sm text-foreground outline-none appearance-none pr-4 cursor-pointer">
                                <option value="newest" className="bg-background">
                                    Newest First
                                </option>
                                <option value="oldest" className="bg-background">
                                    Oldest First
                                </option>
                                <option value="score_high" className="bg-background">
                                    Highest Score
                                </option>
                                <option value="score_low" className="bg-background">
                                    Lowest Score
                                </option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* List */}
                {loading ? (
                    <div className="flex items-center justify-center py-30">
                        <div className="size-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : processedData.length === 0 ? (
                    <div className="rounded-3xl border border-border/60 bg-card/50 backdrop-blur-sm p-12 text-center">
                        <Search size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">{searchQuery ? "No matching analyses" : "No analyses yet"}</h3>
                        <p className="text-sm text-muted-foreground">{searchQuery ? "Try a different search term." : "Run your first SEO analysis to see it here."}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {processedData.map((a) => (
                            <div key={a._id} className="group relative rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-4 sm:p-5 overflow-hidden flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all duration-300 hover:border-purple-accent/30 hover:-translate-y-0.5 hover:shadow-[0_10px_35px_rgba(147,51,234,0.12)]">
                                <div className="pointer-events-none absolute -right-10 -top-10 w-32 h-32 rounded-full bg-purple-accent/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                {/* Score */}
                                <div className="relative shrink-0">
                                    {a.status === "completed" ? (
                                        <ScoreGauge score={a.overallScore} size={52} strokeWidth={4} />
                                    ) : a.status === "processing" ? (
                                        <div className="w-[52px] h-[52px] rounded-full border border-border/50 bg-muted/20 flex items-center justify-center">
                                            <Loader2 size={20} className="text-purple-accent animate-spin" />
                                        </div>
                                    ) : (
                                        <div className="w-[52px] h-[52px] rounded-full border border-border/50 bg-muted/20 flex items-center justify-center">
                                            <AlertCircle size={20} className="text-danger" />
                                        </div>
                                    )}
                                </div>

                                {/* URL + Meta */}
                                <div className="relative flex-1 min-w-0">
                                    <Link to={`/report/${a._id}`} className="text-sm font-medium text-foreground hover:text-purple-accent transition-colors truncate block">
                                        {(() => {
                                            try {
                                                return new URL(a.url).hostname;
                                            } catch {
                                                return a.url;
                                            }
                                        })()}
                                    </Link>
                                    <p className="text-xs text-muted-foreground truncate mt-0.5">{a.url}</p>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock size={12} />
                                            {new Date(a.createdAt).toLocaleDateString()}
                                        </span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${a.status === "completed" ? "bg-success/10 text-success" : a.status === "processing" ? "bg-purple-accent/10 text-purple-accent" : "bg-danger/10 text-danger"}`}>{a.status}</span>
                                    </div>
                                </div>

                                {/* Category scores */}
                                {a.status === "completed" && (
                                    <div className="relative hidden lg:grid grid-cols-4 gap-4">
                                        {[
                                            { label: "SEO", value: a.categories.seo },
                                            { label: "Perf", value: a.categories.performance },
                                            { label: "A11y", value: a.categories.accessibility },
                                            { label: "BP", value: a.categories.bestPractices },
                                        ].map((c) => (
                                            <div key={c.label} className="text-center w-12">
                                                <p className="text-sm font-bold" style={{ color: scoreColor(c.value) }}>
                                                    {c.value}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground">{c.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="relative flex items-center gap-2 shrink-0">
                                    <Link to={`/report/${a._id}`} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-purple-accent transition-all" title="View Report">
                                        <ExternalLink size={16} />
                                    </Link>
                                    <button onClick={() => setConfirmDeleteId(a._id)} disabled={deleting === a._id} className="p-2 rounded-lg hover:bg-danger/10 text-muted-foreground hover:text-danger transition-all disabled:opacity-50" title="Delete">
                                        {deleting === a._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-xl border border-border/50 bg-muted/10 text-sm text-foreground disabled:opacity-30 hover:bg-muted/30 transition-all">
                            Previous
                        </button>
                        <span className="px-4 py-2 text-sm text-muted-foreground">
                            Page {page} of {totalPages}
                        </span>
                        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 rounded-xl border border-border/50 bg-muted/10 text-sm text-foreground disabled:opacity-30 hover:bg-muted/30 transition-all">
                            Next
                        </button>
                    </div>
                )}
            </div>

            <ConfirmDialog
                open={!!confirmDeleteId}
                title="Delete this analysis?"
                message="This will permanently remove the analysis and its report. This can't be undone."
                onCancel={() => setConfirmDeleteId(null)}
                onConfirm={() => {
                    if (confirmDeleteId) handleDelete(confirmDeleteId);
                    setConfirmDeleteId(null);
                }}
            />
        </div>
    );
}
