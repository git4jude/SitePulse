import { Activity, Globe, Mail } from "lucide-react";
import { SiGithub, SiInstagram, SiBehance } from "@icons-pack/react-simple-icons";
import { Link } from "react-router-dom";

function LinkedinIcon({ size = 18 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
    );
}

const PRODUCT_LINKS = [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
];

const SOCIAL_LINKS = [
    { label: "GitHub", href: "https://github.com/git4jude", icon: <SiGithub size={17} /> },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/judechihan", icon: <LinkedinIcon size={17} /> },
    { label: "Portfolio", href: "https://judedevportfolio.vercel.app/", icon: <Globe size={17} /> },
    { label: "Behance", href: "https://www.behance.net/jude_dev", icon: <SiBehance size={17} /> },
    { label: "Instagram", href: "https://www.instagram.com/judejochimson_judechihan", icon: <SiInstagram size={17} /> },
    { label: "Email", href: "mailto:judechihan727@gmail.com", icon: <Mail size={17} /> },
];

export default function Footer() {
    return (
        <footer className="relative border-t border-border/60 bg-card/40 backdrop-blur-sm overflow-hidden">
            <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[36rem] h-[20rem] rounded-full bg-purple-accent/10 blur-3xl" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14">
                <div className="grid grid-cols-1 md:grid-cols-[1.4fr_auto] gap-10 md:gap-16 mb-10">
                    {/* Brand + social */}
                    <div>
                        <Link to="/" className="inline-flex items-center gap-2 mb-3">
                            <Activity className="text-purple-accent" size={22} />
                            <span className="text-xl font-semibold text-foreground">SitePulse</span>
                        </Link>
                        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-6">Optimize your website for search engines with AI-powered insights and real-time tracking.</p>

                        <div className="flex items-center gap-2.5 flex-wrap">
                            {SOCIAL_LINKS.map((s) => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={s.label}
                                    title={s.label}
                                    className="w-9 h-9 rounded-lg border border-border/70 dark:border-border/50 bg-muted/50 dark:bg-muted/10 flex items-center justify-center text-muted-foreground transition-all hover:-translate-y-0.5 hover:text-purple-accent hover:border-purple-accent/40 hover:bg-purple-accent/5"
                                >
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Product */}
                    <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Product</h3>
                        <ul className="space-y-2.5">
                            {PRODUCT_LINKS.map((l) => (
                                <li key={l.label}>
                                    <a href={l.href} className="text-sm text-muted-foreground hover:text-purple-accent transition-colors">
                                        {l.label}
                                    </a>
                                </li>
                            ))}
                            <li>
                                <Link to="/register" className="text-sm text-muted-foreground hover:text-purple-accent transition-colors">
                                    Get Started
                                </Link>
                            </li>
                            <li>
                                <Link to="/login" className="text-sm text-muted-foreground hover:text-purple-accent transition-colors">
                                    Log In
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} SitePulse. Built by Jude Chihan.</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                        All systems operational
                    </div>
                </div>
            </div>
        </footer>
    );
}
