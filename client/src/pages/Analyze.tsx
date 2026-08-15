/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { SearchIcon, GlobeIcon, FileSearchIcon, BrainIcon, CheckCircleIcon, AlertCircle, Loader2, ArrowRightIcon, SparklesIcon, ZapIcon, AccessibilityIcon, ShieldCheckIcon, LinkIcon, FileTextIcon } from "lucide-react";
import { useUser } from "../context/UserContext";

const STEPS = [
    { icon: <GlobeIcon size={22} />, label: "Connecting to browser", desc: "Creating cloud browser session..." },
    { icon: <FileSearchIcon size={22} />, label: "Scanning website", desc: "Extracting meta tags, links, images..." },
    { icon: <BrainIcon size={22} />, label: "AI Analysis", desc: "Gemini is analyzing your SEO data..." },
    { icon: <CheckCircleIcon size={22} />, label: "Report Ready", desc: "Your SEO report is complete!" },
];

const EXAMPLE_DOMAINS = ["github.com", "stripe.com", "vercel.com"];

const FEATURES = [
    { icon: <SearchIcon size={18} />, label: "SEO Score", desc: "On-page optimization insights", iconClass: "text-purple-accent", bgClass: "bg-purple-accent/15 dark:bg-purple-accent/10", hover: "hover:border-purple-accent/40" },
    { icon: <ZapIcon size={18} />, label: "Performance Audit", desc: "Speed & load time analysis", iconClass: "text-success", bgClass: "bg-success/15 dark:bg-success/10", hover: "hover:border-success/40" },
    { icon: <AccessibilityIcon size={18} />, label: "Accessibility Check", desc: "WCAG compliance scan", iconClass: "text-warning", bgClass: "bg-warning/15 dark:bg-warning/10", hover: "hover:border-warning/40" },
    { icon: <ShieldCheckIcon size={18} />, label: "Best Practices", desc: "Security & modern standards", iconClass: "text-danger", bgClass: "bg-danger/15 dark:bg-danger/10", hover: "hover:border-danger/40" },
];

const HOW_STEPS = [
    { icon: <LinkIcon size={20} />, title: "Enter URL", desc: "Paste any website address you want to audit." },
    { icon: <BrainIcon size={20} />, title: "We Analyze", desc: "Our AI scans SEO, performance, accessibility & more." },
    { icon: <FileTextIcon size={20} />, title: "Get Report", desc: "Receive a detailed, actionable audit report." },
];

const scoreColor = (s: number) => {
    if (s >= 80) return "var(--ring-success)";
    if (s >= 50) return "var(--ring-warning)";
    return "var(--ring-danger)";
};

interface RecentScan {
    _id: string;
    url: string;
    overallScore: number;
    status: string;
}

export default function Analyze() {
    const { api } = useUser();
    const [url, setUrl] = useState("");
    const [analyzing, setAnalyzing] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [error, setError] = useState("");
    const [focused, setFocused] = useState(false);
    const [recentScans, setRecentScans] = useState<RecentScan[]>([]);
    const [searchParams] = useSearchParams();
    const pollRef = useRef<any>(null);

    const navigate = useNavigate();

    const handleAnalyze = async (submitUrl?: string) => {
        const targetUrl = submitUrl || url;
        if (!targetUrl.trim()) return;

        setError("");
        setAnalyzing(true);
        setCurrentStep(0);

      try {
        //step0 : connecting
        setCurrentStep(0);
        const res = await api.post('/analysis/analyze', {
            url: targetUrl.startsWith("http") ? targetUrl : `https://${targetUrl}`,
        })
        if(!res.data.success){
            throw new Error(res.data.message)
        }
        const id = res.data.analysisId;

        //step 1: scanning
        setCurrentStep(1);

        //poll for completion
        let attempts = 0;
        const maxAttempts = 60;

        pollRef.current = setInterval(async () => {
            attempts++;
            if(attempts > maxAttempts){
                if(pollRef.current) clearInterval(pollRef.current)
                    setError("Analysis is checking longer the expected check your history later");
                setAnalyzing(false);
                return
            }
            try {
                const check = await api.get(`/analysis/${id}`)
                const analysis = check.data.analysis;

                if(analysis.status === "completed"){
                    if(pollRef.current) clearInterval(pollRef.current)
                        setCurrentStep(3)
                    setTimeout(() => navigate(`/report/${id}`), 1000)
                }else if(analysis.status === "failed"){
                    if(pollRef.current) clearInterval(pollRef.current)
                        setError("Analysis Failed..the AI model might be down.")
                    setAnalyzing(false)
                }else{
                    // still processing - advance visual steps
                    if(attempts > 5) setCurrentStep(2)

                }
            } catch {
                //Ignore polling errors
            }
        }, 2000)
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || "Failed to start analysis")
        setAnalyzing(false)
      }
    };

    const handleSubmit = (e: React.SubmitEvent) => {
        e.preventDefault();
        handleAnalyze();
    };

    useEffect(() => {
        const prefillUrl = searchParams.get("url");
        if (prefillUrl) {
            (() => setUrl(prefillUrl))();
            // Auto-start if URL is provided
            setTimeout(() => handleAnalyze(prefillUrl), 500);
        }

        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, []);

    useEffect(() => {
        api
            .get("/analysis/list?limit=4")
            .then((res) => {
                if (res.data.success) {
                    setRecentScans(res.data.analyses.filter((a: RecentScan) => a.status === "completed"));
                }
            })
            .catch(() => {});
    }, []);

    return (
        <div className="dashboard-mesh-bg min-h-screen pt-16 md:pt-24 overflow-hidden">
            <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
                {!analyzing ? (
                    <div>
                        {/* Hero */}
                        <div className="text-center max-w-2xl mx-auto mb-10">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-purple-accent/25 bg-purple-accent/10 text-purple-accent text-[11px] font-semibold uppercase tracking-wider mb-5">
                                <SparklesIcon size={12} />
                                AI-Powered Audit
                            </div>
                            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4 leading-tight">
                                Analyze{" "}
                                <span className="relative inline-block">
                                    <span className="gradient-text">Any Website</span>
                                    <span className="absolute left-0 -bottom-1 h-[3px] w-full rounded-full opacity-70" style={{ background: "linear-gradient(90deg, var(--purple-soft), var(--purple-accent), transparent)" }} />
                                </span>
                            </h1>
                            <p className="text-muted-foreground text-base sm:text-lg">Enter a URL to get a comprehensive AI-powered SEO audit report in seconds.</p>
                        </div>

                        {error && (
                            <div className="mb-6 px-4 py-3 rounded-xl severity-critical text-sm flex items-center gap-2 max-w-xl mx-auto">
                                <AlertCircle size={18} className="shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Search — glowing gradient-border focal point */}
                        <form onSubmit={handleSubmit} className="max-w-xl mx-auto mb-6">
                            <div
                                className="relative rounded-full p-[1.5px] transition-shadow duration-300"
                                style={{
                                    background: focused ? "linear-gradient(135deg, var(--purple-soft), var(--purple-accent))" : "var(--border)",
                                    boxShadow: focused ? "0 0 0 6px rgba(147,51,234,0.12), 0 12px 34px rgba(147,51,234,0.22)" : "none",
                                }}
                            >
                                <div className="flex items-center gap-2 rounded-full p-1.5 px-2" style={{ background: "var(--background)" }}>
                                    <div className="flex items-center gap-3 flex-1 px-3">
                                        <SearchIcon size={20} className={`shrink-0 transition-colors ${focused ? "text-purple-accent" : "text-muted-foreground"}`} />
                                        <input
                                            type="text"
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            onFocus={() => setFocused(true)}
                                            onBlur={() => setFocused(false)}
                                            placeholder="Enter website URL (e.g., example.com)"
                                            className="w-full bg-transparent text-foreground placeholder-muted-foreground outline-none text-base py-3"
                                            id="analyze-url-input"
                                            autoFocus
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="bg-primary px-6 py-3 rounded-full flex items-center gap-2 text-primary-foreground text-sm hover:opacity-90 hover:scale-[1.03] active:scale-[0.98] transition-all shrink-0"
                                        id="analyze-submit-btn"
                                        style={{ color: "var(--background)" }}
                                    >
                                        Analyze <ArrowRightIcon className="text-background size-4 shrink-0" />
                                    </button>
                                </div>
                            </div>
                        </form>

                        {/* Example domain pills */}
                        <div className="flex flex-wrap items-center justify-center gap-2 mb-14">
                            <span className="text-xs text-muted-foreground mr-1">Try:</span>
                            {EXAMPLE_DOMAINS.map((ex) => (
                                <button
                                    key={ex}
                                    onClick={() => setUrl(ex)}
                                    className="px-3.5 py-1.5 rounded-full border border-border/80 dark:border-border/60 bg-muted/50 dark:bg-muted/10 text-xs font-medium text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-purple-accent/40 hover:text-purple-accent hover:bg-purple-accent/5"
                                >
                                    {ex}
                                </button>
                            ))}
                        </div>

                        {/* Recent scans quick-access */}
                        {recentScans.length > 0 && (
                            <div className="mb-14">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 text-center">Recent Scans</p>
                                <div className="flex flex-wrap justify-center gap-3">
                                    {recentScans.map((a) => (
                                        <Link
                                            key={a._id}
                                            to={`/report/${a._id}`}
                                            className="group flex items-center gap-2.5 rounded-full border border-border/70 dark:border-border/50 bg-muted/50 dark:bg-muted/10 pl-2.5 pr-4 py-2 text-sm transition-all hover:-translate-y-0.5 hover:border-purple-accent/40 hover:bg-muted/70 dark:hover:bg-muted/20"
                                        >
                                            <span
                                                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                                                style={{ background: `color-mix(in srgb, ${scoreColor(a.overallScore)} 18%, transparent)`, color: scoreColor(a.overallScore) }}
                                            >
                                                {a.overallScore}
                                            </span>
                                            <span className="text-foreground font-medium truncate max-w-[160px]">{new URL(a.url).hostname}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Feature strip */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
                            {FEATURES.map((f) => (
                                <div key={f.label} className={`group rounded-2xl border border-border/70 dark:border-border/40 bg-muted/50 dark:bg-muted/10 p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${f.hover}`}>
                                    <div className={`w-11 h-11 mx-auto rounded-xl flex items-center justify-center mb-3 ${f.bgClass} ${f.iconClass}`}>{f.icon}</div>
                                    <p className="text-sm font-semibold text-foreground">{f.label}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
                                </div>
                            ))}
                        </div>

                        {/* How it works */}
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-5 text-center">How It Works</p>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-start justify-center gap-4 sm:gap-3">
                                {HOW_STEPS.map((step, i) => (
                                    <div key={step.title} className="flex items-center sm:contents">
                                        <div className="flex-1 sm:flex-none sm:w-56 flex flex-col items-center text-center gap-3 rounded-2xl border border-border/70 dark:border-border/40 bg-muted/50 dark:bg-muted/10 px-5 py-6">
                                            <div className="w-11 h-11 rounded-xl bg-purple-accent/15 dark:bg-purple-accent/10 border border-purple-accent/25 dark:border-purple-accent/20 flex items-center justify-center text-purple-accent">{step.icon}</div>
                                            <div>
                                                <p className="text-sm font-semibold text-foreground">{step.title}</p>
                                                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{step.desc}</p>
                                            </div>
                                        </div>
                                        {i < HOW_STEPS.length - 1 && <ArrowRightIcon size={18} className="hidden sm:block text-muted-foreground/30 shrink-0 mx-1 mt-10" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto">
                        {/* Analyzing State */}
                        <div className="text-center mb-12">
                            <h2 className="text-2xl font-medium text-foreground">Analyzing Your Website</h2>
                            <div className="flex justify-center items-center gap-2 mt-2">
                                <Loader2 size={16} className="text-primary/60 mt-0.5 animate-spin" />
                                <p className="text-muted-foreground sm:text-lg">{url}</p>
                            </div>
                        </div>

                        {/* Progress Steps */}
                        <div className="max-w-md mx-auto space-y-4">
                            {STEPS.map((step, i) => {
                                const isComplete = i < currentStep;
                                const isCurrent = i === currentStep;
                                const isPending = i > currentStep;

                                return (
                                    <div key={step.label} className={`flex items-center gap-4 p-4 rounded-xl transition-all ${isCurrent ? "glass-strong border-primary/30" : isComplete ? "glass opacity-60" : "glass opacity-30"}`}>
                                        <div
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isComplete ? "bg-success/15 text-success" : isCurrent ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                                            style={isCurrent ? { color: "var(--background)" } : {}}
                                        >
                                            {isComplete ? <CheckCircleIcon size={20} /> : step.icon}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-sm font-medium ${isPending ? "text-muted-foreground" : "text-foreground"}`}>{step.label}</p>
                                            <p className="text-xs text-muted-foreground">{step.desc}</p>
                                        </div>
                                        {isCurrent && <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />}
                                    </div>
                                );
                            })}
                        </div>

                        <p className="text-center text-xs text-muted-foreground mt-8">This may take 15-30 seconds depending on the website.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
