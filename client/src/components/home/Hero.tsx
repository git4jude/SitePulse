import { SearchIcon, ArrowRightIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import WebThreads from "../WebThreads";

export default function Hero() {
    const [url, setUrl] = useState("");
    const navigate = useNavigate();

    const handleQuickAnalyze = (e: React.SubmitEvent) => {
        e.preventDefault();
        navigate(`/analyze?url=${encodeURIComponent(url)}`);
    };

    return (
        <section className="relative w-full min-h-screen overflow-hidden">
            <div className="absolute inset-0 -z-10 pointer-events-none">
                <WebThreads
                    color1="#9333EA"
                    color2="#8B5CF6"
                    color3="#FFFFFF"
                    speed={0.2}
                    threadCount={6}
                    frequency={5}
                    spread={0.18}
                    taper={1}
                    position={0.5}
                    fanMode="center"
                    glow={0.02}
                    falloff={0.6}
                    thickness={1.1}
                    brightness={0.35}
                    opacity={0.35}
                    mirror
                    shimmer={false}
                    grain
                    grainIntensity={0.05}
                    mouseInteraction={false}
                    mouseStrength={0.3}
                />
            </div>

            <div className="relative max-w-4xl mx-auto px-4 pt-52 pb-40 sm:pt-50 sm:pb-44 text-center ">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/2 rounded-full text-sm text-primary mb-6 border border-primary/15">
                    <div className="relative flex items-center justify-center">
                        <div className="absolute bg-accent size-2 rounded-full animate-ping"></div>
                        <div className="bg-accent size-1.5 rounded-full"></div>
                    </div>
                    Powered by BrowserBase & Gemini AI
                </div>
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-medium leading-tight mb-6 text-foreground">
                    Analyze & Boost Your
                    <br />
                    <span className="gradient-text dm-serif">SEO Rankings</span>
                </h1>
                <p className="text-base  text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">Get instant AI-powered SEO audits for any website. Uncover hidden issues, optimize performance, and outrank your competition.</p>

                {/* URL Input Bar */}
                <form onSubmit={handleQuickAnalyze} className="max-w-2xl mx-auto relative">
                    <div className="bg-card border border-border rounded-full px-2 py-1.5 flex items-center gap-2 animate-pulse-glow">
                        <div className="flex items-center gap-2 flex-1 px-3">
                            <SearchIcon size={16} className="text-muted-foreground shrink-0" />
                            <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Enter website URL (e.g., example.com)" className="w-full bg-transparent text-foreground placeholder-muted-foreground outline-none text-base py-2" id="hero-url-input" />
                        </div>

                        <button type="submit" className="bg-primary px-5 py-2.5 rounded-full text-primary-foreground text-base hover:opacity-90 transition-opacity shrink-0 flex items-center gap-2" id="hero-analyze-btn" style={{ color: "var(--background)" }}>
                            Analyze
                            <ArrowRightIcon size={14} />
                        </button>
                    </div>
                </form>

                <p className="text-muted-foreground text-base mt-6 ">Free — No credit card required • 5 analyses per day</p>
            </div>
        </section>
    );
}
