import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useUser } from "../../context/UserContext";
import { Sun, Moon, Activity } from "lucide-react";

export default function LandingNavbar() {
    const { user } = useUser();
    const { theme, setTheme } = useTheme();

    return (
        <div className="fixed top-4 inset-x-0 mx-auto z-50 w-[95%] max-w-6xl">
            <nav className="relative overflow-hidden rounded-2xl border border-border shadow-lg bg-background">
                <div className="relative flex items-center justify-between h-16 px-5 sm:px-6">
                    <Link to="/" className="flex items-center gap-2">
                        <Activity className="text-[#9333EA]" size={22} />
                        <span className="text-lg font-medium tracking-tight text-[#9333EA]">SitePulse</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
                        <a href="#features" className="hover:text-foreground transition-colors">
                            Features
                        </a>
                        <a href="#pricing" className="hover:text-foreground transition-colors">
                            Pricing
                        </a>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors flex items-center justify-center" aria-label="Toggle theme">
                            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

                        {user ? (
                            <Link to="/dashboard" className="px-4 py-2 rounded-full bg-primary text-sm font-semibold hover:opacity-90 transition-opacity" style={{ color: "var(--background)" }}>
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="hidden sm:block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                    Log In
                                </Link>
                                <Link to="/register" className="px-4 py-2 rounded-full bg-primary text-sm font-semibold hover:opacity-90 transition-opacity" style={{ color: "var(--background)" }}>
                                    Get started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>
        </div>
    );
}
