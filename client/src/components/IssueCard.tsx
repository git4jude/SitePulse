import { useState } from "react";
import { ChevronDown, ChevronUp, AlertTriangle, AlertCircle, Info } from "lucide-react";

interface Issue {
    severity: string;
    category: string;
    message: string;
    recommendation: string;
}

export default function IssueCard({ issue }: { issue: Issue }) {
    const [expanded, setExpanded] = useState(false);

    const severityConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
        critical: {
            icon: <AlertCircle size={14} />,
            color: "var(--ring-danger)",
            label: "Critical",
        },
        warning: {
            icon: <AlertTriangle size={14} />,
            color: "var(--ring-warning)",
            label: "Warning",
        },
        info: {
            icon: <Info size={14} />,
            color: "var(--accent)",
            label: "Info",
        },
    };

    const config = severityConfig[issue.severity] || severityConfig.info;

    return (
        <div className="group flex items-start gap-3 py-3 pl-4 pr-2 border-l-[3px] rounded-r-lg cursor-pointer transition-colors hover:bg-muted/30" style={{ borderColor: config.color }} onClick={() => setExpanded(!expanded)}>
            <span className="mt-0.5 shrink-0" style={{ color: config.color }}>
                {config.icon}
            </span>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-foreground">{issue.message}</p>
                    <span className="text-[10px] font-bold uppercase tracking-wide shrink-0" style={{ color: config.color }}>
                        {config.label}
                    </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{issue.category}</p>
                {expanded && (
                    <div className="mt-2.5 flex items-start gap-2 rounded-lg bg-muted/20 p-3">
                        <span className="text-purple-accent text-sm shrink-0">💡</span>
                        <p className="text-xs text-muted-foreground leading-relaxed">{issue.recommendation}</p>
                    </div>
                )}
            </div>
            <div className="text-muted-foreground shrink-0 mt-0.5">{expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</div>
        </div>
    );
}
