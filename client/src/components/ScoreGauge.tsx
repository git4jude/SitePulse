import { useEffect, useState } from "react";

interface ScoreGaugeProps {
    score: number;
    size?: number;
    strokeWidth?: number;
    label?: string;
    glow?: boolean;
}

export default function ScoreGauge({ score, size = 140, strokeWidth = 10, label, glow = false }: ScoreGaugeProps) {
    const [animatedScore, setAnimatedScore] = useState(0);

    useEffect(() => {
        const t = setTimeout(() => setAnimatedScore(score), 80);
        return () => clearTimeout(t);
    }, [score]);

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (animatedScore / 100) * circumference;
    const offset = circumference - progress;

    const getColor = (s: number) => {
        if (s >= 80) return "var(--ring-success)";
        if (s >= 50) return "var(--ring-warning)";
        return "var(--ring-danger)";
    };

    const color = getColor(score);

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative" style={{ width: size, height: size, filter: glow ? `drop-shadow(0 0 28px color-mix(in srgb, ${color} 45%, transparent))` : undefined }}>
                <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
                    {/* Background circle */}
                    <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} />
                    {/* Progress circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        style={{
                            strokeDasharray: circumference,
                            strokeDashoffset: offset,
                            transition: "stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
                        }}
                    />
                </svg>
                {/* Score text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-display font-bold" style={{ fontSize: size * 0.3, color }}>
                        {score}
                    </span>
                </div>
            </div>
            {label && <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">{label}</span>}
        </div>
    );
}
