/* eslint-disable @typescript-eslint/no-explicit-any */
import { AlertTriangleIcon, ClockIcon } from "lucide-react";
import { Link } from "react-router-dom";

const getScoreColor = (s: number) => {
    if (s >= 80) return "var(--ring-success)";
    if (s >= 50) return "var(--ring-warning)";
    return "var(--ring-danger)";
};

function MiniRing({ label, value }: { label: string; value: number }) {
    const size = 46;
    const strokeWidth = 4;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;
    const color = getScoreColor(value);

    return (
        <div className="flex flex-col items-center gap-1.5">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
                    <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} />
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        style={{ strokeDasharray: circumference, strokeDashoffset: offset, transition: "stroke-dashoffset 0.7s ease-out" }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold" style={{ color }}>
                        {value}
                    </span>
                </div>
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
        </div>
    );
}

export default function AnalysesCard({ analysis, className = "" }: { analysis: any; className?: string }) {
    const metrics = [
        { label: "SEO", value: analysis.categories?.seo ?? 0 },
        { label: "Perf", value: analysis.categories?.performance ?? 0 },
        { label: "A11y", value: analysis.categories?.accessibility ?? 0 },
        { label: "BP", value: analysis.categories?.bestPractices ?? 0 },
    ];

    return (
        <Link
            key={analysis._id}
            to={`/report/${analysis._id}`}
            className={`group relative flex w-full flex-col rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm p-5 sm:p-6 overflow-hidden transition-all duration-300 hover:border-purple-accent/40 hover:-translate-y-0.5 hover:shadow-[0_10px_35px_rgba(147,51,234,0.14)] ${className}`}
        >
            <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-purple-accent/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative flex items-start justify-between gap-4 mb-5">
                <div className="min-w-0">
                    <p className="text-base font-semibold text-foreground truncate group-hover:text-purple-accent transition-colors">{new URL(analysis.url).hostname}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{analysis.url}</p>
                </div>

                {analysis.status === "completed" ? (
                    <span className="font-display text-4xl font-bold leading-none shrink-0" style={{ color: getScoreColor(analysis.overallScore) }}>
                        {analysis.overallScore}
                    </span>
                ) : analysis.status === "processing" ? (
                    <div className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center shrink-0">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="w-10 h-10 rounded-full border-2 border-danger/30 flex items-center justify-center shrink-0">
                        <AlertTriangleIcon size={16} className="text-danger" />
                    </div>
                )}
            </div>

            {analysis.status === "completed" && (
                <div className="relative flex items-center justify-between gap-2 mb-4 px-1">
                    {metrics.map((m) => (
                        <MiniRing key={m.label} label={m.label} value={m.value} />
                    ))}
                </div>
            )}

            <div className="relative mt-auto flex items-center gap-1.5 text-[11px] text-muted-foreground pt-3 border-t border-border/40">
                <ClockIcon size={11} /> {new Date(analysis.createdAt).toLocaleDateString()}
            </div>
        </Link>
    );
}
