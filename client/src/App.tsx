import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Analyze from "./pages/Analyze";
import Report from "./pages/Report";
import History from "./pages/History";
import RankTracker from "./pages/RankTracker";
import RankDetail from "./pages/RankDetail";
import { Toaster } from "react-hot-toast";
import { useUser } from "./context/UserContext";
import Loading from "./components/Loading";

export default function App() {
    const {user, loading} = useUser();

    const location = useLocation();

    const hideNavbar = ["/", "/login", "/register"].includes(location.pathname);

    if(loading) return <Loading />

    return (
        <>
            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 3500,
                    style: {
                        background: "#ffffff",
                        color: "#111827",
                        border: "1px solid #e5e7eb",
                        borderRadius: "0.75rem",
                        padding: "10px 14px",
                        fontSize: "0.875rem",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
                    },
                    success: {
                        iconTheme: { primary: "var(--ring-success)", secondary: "#ffffff" },
                        style: { border: "1px solid rgba(16,185,129,0.3)" },
                    },
                    error: {
                        iconTheme: { primary: "var(--ring-danger)", secondary: "#ffffff" },
                        style: { border: "1px solid rgba(239,68,68,0.3)" },
                    },
                }}
            />
            {!hideNavbar && <Navbar />}
            <Routes>
                <Route path="/" element={<Home />} />

                <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login state="login" />} />

                <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Login state="register" />} />

                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/analyze" element={<Analyze />} />
                    <Route path="/report/:id" element={<Report />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/rank-tracker" element={<RankTracker />} />
                    <Route path="/rank/:id" element={<RankDetail />} />
                </Route>
            </Routes>
        </>
    );
}
