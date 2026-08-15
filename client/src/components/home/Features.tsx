/* eslint-disable @typescript-eslint/no-explicit-any */
import { homeFeaturesData } from "../../assets/assets";
import SpotlightCard from "../SpotlightCard";
import TrueFocus from "../TrueFocus";

const purpleShades = [
    { border: "#9333EA", spotlight: "rgba(147, 51, 234, 0.35)" },
    { border: "#8B5CF6", spotlight: "rgba(139, 92, 246, 0.35)" },
    { border: "#A78BFA", spotlight: "rgba(167, 139, 250, 0.35)" },
] as const;

export default function Features() {
    return (
        <section id="features" className="relative md:min-h-screen flex flex-col justify-center items-center max-lg:py-24">
            <div className="bg-dot-pattern absolute inset-0 -z-1 opacity-10"></div>
            <div className="max-w-6xl mx-auto flex flex-col items-center justify-center px-4 ">
                <div className="text-center mb-14">
                    <h2 className="text-4xl sm:text-5xl font-semibold mb-8 text-foreground">
                        Everything You Need to{" "}
                        <span className="inline-flex align-middle">
                            <TrueFocus sentence="Rank Higher" manualMode={false} blurAmount={5} borderColor="#9333EA" glowColor="rgba(147, 51, 234, 0.6)" animationDuration={0.5} pauseBetweenAnimations={1} />
                        </span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-lg mx-auto">Comprehensive SEO analysis powered by real browser rendering and artificial intelligence.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-7">
                    {homeFeaturesData.map((f: any, i: number) => {
                        const shade = purpleShades[i % purpleShades.length];
                        return (
                            <SpotlightCard
                                key={f.title}
                                spotlightColor={shade.spotlight}
                                style={{
                                    backgroundColor: "var(--card)",
                                    borderColor: shade.border,
                                }}
                            >
                                <div className="text-primary mb-4 inline-block">{f.icon}</div>
                                <h3 className="text-xl font-medium mb-2 text-foreground">{f.title}</h3>
                                <p className="w-5/6 text-base text-muted-foreground leading-relaxed">{f.desc}</p>
                            </SpotlightCard>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
