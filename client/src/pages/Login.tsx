import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, Loader2, User2Icon, Eye, EyeOff, ArrowLeft, Activity } from "lucide-react";
import { useUser } from "../context/UserContext";
import { toast } from "react-hot-toast";

export default function Login({ state }: { state: string }) {
    const [isLoginState, setIsLoginState] = useState(state === "login");
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const {login, register} = useUser()
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setLoading(true);

        let result;
        if(isLoginState){
            result = await login(email, password);
        }else{
            result = await register(name, email, password);
        }

        if(result.success){
            const redirect = searchParams.get("redirect") || "/dashboard";
            navigate(redirect, { replace: true });
        }else{
            toast.error(result.message || "An error occurred. Please try again.");
        }
        setLoading(false);
    };

    return (
        <div className="h-screen w-screen flex overflow-hidden">
            {/* Left Panel - Image */}
            <div className="w-[45%] shrink-0 relative z-10 overflow-hidden bg-black shadow-2xl">
                <button
                    onClick={() => navigate("/")}
                    className="absolute top-6 left-6 z-10 w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-[#9333EA]/70 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a78bfa]"
                >
                    <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <img src={isLoginState ? "/login.png" : "/signup.png"} alt="" className="block w-full h-full object-cover object-center" />
            </div>

            {/* Right Panel - Form */}
            <div
                className="flex-1 relative flex flex-col items-center justify-center bg-background border-l border-border px-6 sm:px-12 lg:px-20 overflow-y-auto overflow-x-hidden"
                style={{
                    backgroundImage: "radial-gradient(circle, rgba(147, 51, 234, 0.18) 1px, transparent 1px)",
                    backgroundSize: "22px 22px",
                }}
            >
                <div className="relative w-full max-w-md py-12">
                    <div className="signin-fade-in flex items-center justify-center gap-2 mb-10" style={{ "--signin-delay": "0ms" } as React.CSSProperties}>
                        <Activity className="text-[#9333EA]" size={26} />
                        <span className="text-4xl text-center font-medium tracking-tight text-[#9333EA]">SitePulse</span>
                    </div>

                    <div className="relative signin-fade-in" style={{ "--signin-delay": "60ms" } as React.CSSProperties}>
                        <div
                            className="rounded-2xl p-8 sm:p-10"
                            style={{
                                background: "var(--signin-card-bg)",
                                backdropFilter: "blur(20px)",
                                WebkitBackdropFilter: "blur(20px)",
                                border: "1px solid rgba(139,92,246,0.15)",
                                boxShadow: "0 25px 70px rgba(0,0,0,0.7)",
                            } as React.CSSProperties}
                        >
                        <div className="mb-8">
                            <h1 className="text-3xl font-medium text-foreground mb-2.5">{isLoginState ? "Welcome Back" : "Create an Account"}</h1>
                            <p className="text-muted-foreground text-sm">
                                {isLoginState ? "Don't have an account?" : "Already have an account?"}{" "}
                                <button
                                    type="button"
                                    onClick={() => setIsLoginState((prev) => !prev)}
                                    className="text-[#9333EA] hover:text-[#a78bfa] underline decoration-transparent hover:decoration-current transition-colors duration-200 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a78bfa]"
                                >
                                    {isLoginState ? "Sign up" : "Sign in"}
                                </button>
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                        {!isLoginState && (
                            <label className="block">
                                <div className="text-sm text-foreground mb-2">Name</div>
                                <div className="group flex items-center gap-3 px-4 py-3.5 border border-foreground/15 rounded-xl bg-foreground/5 transition-[border-color,box-shadow] duration-200 focus-within:border-[#8b5cf6] focus-within:shadow-[0_0_0_3px_rgba(139,92,246,0.15)]">
                                    <User2Icon size={18} className="text-muted-foreground shrink-0 transition-colors duration-200 group-focus-within:text-[#a78bfa]" />
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your name"
                                        className="w-full bg-transparent text-foreground placeholder-muted-foreground outline-none text-sm"
                                    />
                                </div>
                            </label>
                        )}

                        <label className="block">
                            <div className="text-sm text-foreground mb-2">Email Address</div>
                            <div className="group flex items-center gap-3 px-4 py-3.5 border border-foreground/15 rounded-xl bg-foreground/5 transition-[border-color,box-shadow] duration-200 focus-within:border-[#8b5cf6] focus-within:shadow-[0_0_0_3px_rgba(139,92,246,0.15)]">
                                <Mail size={18} className="text-muted-foreground shrink-0 transition-colors duration-200 group-focus-within:text-[#a78bfa]" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full bg-transparent text-foreground placeholder-muted-foreground outline-none text-sm"
                                />
                            </div>
                        </label>

                        <label className="block">
                            <div className="text-sm text-foreground mb-2">Password</div>
                            <div className="group flex items-center gap-3 px-4 py-3.5 border border-foreground/15 rounded-xl bg-foreground/5 transition-[border-color,box-shadow] duration-200 focus-within:border-[#8b5cf6] focus-within:shadow-[0_0_0_3px_rgba(139,92,246,0.15)]">
                                <Lock size={18} className="text-muted-foreground shrink-0 transition-colors duration-200 group-focus-within:text-[#a78bfa]" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full bg-transparent text-foreground placeholder-muted-foreground outline-none text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="relative shrink-0 w-7 h-7 flex items-center justify-center hover:bg-muted rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a78bfa]"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    <Eye size={18} className={`absolute text-muted-foreground transition-opacity duration-150 ${showPassword ? "opacity-0" : "opacity-100"}`} />
                                    <EyeOff size={18} className={`absolute text-muted-foreground transition-opacity duration-150 ${showPassword ? "opacity-100" : "opacity-0"}`} />
                                </button>
                            </div>
                        </label>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 mt-10 rounded-xl bg-primary text-sm font-medium text-primary-foreground flex items-center justify-center gap-2 transition-[transform,box-shadow,opacity] duration-150 hover:opacity-90 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(139,92,246,0.45)] active:scale-[0.98] disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a78bfa]"
                            id="login-submit-btn"
                            style={{ color: "var(--background)" }}
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : isLoginState ? "Sign In" : "Create Account"}
                        </button>
                        </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
