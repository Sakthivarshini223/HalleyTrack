import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Fingerprint,
  AlertCircle,
} from "lucide-react";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/api/login", {
        email,
        password,
        role,
      });

      if (response.data.success) {
        localStorage.setItem("halley_token", response.data.token);
        localStorage.setItem("user_role", response.data.user.role);
        localStorage.setItem("user_name", response.data.user.name);
        localStorage.setItem("user_email", response.data.user.email);

        if (response.data.user.role === "admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/user-dashboard");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "UPLINK FAILED: ACCESS DENIED");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans text-zinc-200 relative overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-zinc-800/20 blur-[100px] rounded-full" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      <div
        className={`w-full max-w-[400px] relative z-10 group ${
          error ? "animate-shake" : ""
        }`}
      >
        <div
          className={`absolute -inset-0.5 bg-gradient-to-r ${
            error ? "from-red-600/30" : "from-orange-600/20"
          } to-transparent rounded-[2rem] blur-xl opacity-50`}
        />

        <div className="relative bg-[#080808] border border-white/5 p-8 md:p-10 rounded-[2rem] backdrop-blur-3xl shadow-2xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-black border border-white/5 mb-6 shadow-2xl group-hover:border-orange-600/50 transition-all duration-500">
              <Fingerprint
                className={error ? "text-red-500" : "text-orange-600"}
                size={28}
              />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
              HALLY<span className="text-orange-600 not-italic">TRACK</span>
            </h1>
            <p className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.4em] mt-2">
              Authentication Terminal
            </p>
          </div>

          <div className="relative flex p-1 bg-black rounded-xl mb-8 border border-white/5">
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-orange-600 rounded-lg transition-all duration-500 ease-out ${
                role === "admin" ? "left-[calc(50%+2px)]" : "left-1"
              }`}
            />
            <button
              type="button"
              onClick={() => {
                setRole("customer");
                setError("");
              }}
              className={`relative z-10 flex-1 py-2 text-[9px] font-black tracking-widest transition-colors duration-300 ${
                role === "customer" ? "text-white" : "text-zinc-600"
              }`}
            >
              USER
            </button>
            <button
              type="button"
              onClick={() => {
                setRole("admin");
                setError("");
              }}
              className={`relative z-10 flex-1 py-2 text-[9px] font-black tracking-widest transition-colors duration-300 ${
                role === "admin" ? "text-white" : "text-zinc-600"
              }`}
            >
              ADMIN
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[8px] uppercase tracking-widest font-black text-zinc-600 ml-1">
                Identity
              </label>
              <div className="relative">
                <Mail
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                    error ? "text-red-500/50" : "text-zinc-700"
                  }`}
                  size={16}
                />
                <input
                  type="email"
                  required
                  className={`w-full bg-black border ${
                    error ? "border-red-500/50" : "border-white/5"
                  } rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-orange-600/50 transition-all text-[11px] font-bold text-white placeholder:text-zinc-800 uppercase`}
                  placeholder="ID@HALLYTRACK.IO"
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[8px] uppercase tracking-widest font-black text-zinc-600 ml-1">
                Access Key
              </label>
              <div className="relative">
                <Lock
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                    error ? "text-red-500/50" : "text-zinc-700"
                  }`}
                  size={16}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className={`w-full bg-black border ${
                    error ? "border-red-500/50" : "border-white/5"
                  } rounded-xl py-3.5 pl-12 pr-12 outline-none focus:border-orange-600/50 transition-all text-[11px] font-bold text-white placeholder:text-zinc-800`}
                  placeholder="••••••••"
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-700 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-600/5 border border-red-600/20 rounded-lg">
                <AlertCircle size={12} className="text-red-600" />
                <p className="text-[8px] font-black uppercase tracking-tighter text-red-600">
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-4 rounded-xl font-black text-[10px] tracking-[0.3em] flex items-center justify-center gap-2 transition-all uppercase active:scale-[0.98] mt-6 ${
                error
                  ? "bg-red-600 text-white"
                  : "bg-white text-black hover:bg-orange-600 hover:text-white"
              }`}
            >
              {error ? "RETRY UPLINK" : "INITIALIZE UPLINK"}
              <ArrowRight size={14} />
            </button>
          </form>

          <div className="mt-10 flex items-center justify-between border-t border-white/5 pt-6">
            <div className="flex flex-col">
              <span className="text-[7px] text-zinc-700 uppercase font-black tracking-widest mb-1">
                New Identity?
              </span>
              <Link
                to="/register"
                className="text-[9px] text-orange-600 uppercase font-black hover:text-white transition-colors"
              >
                Create Account
              </Link>
            </div>
            <div className="text-right">
              <p className="text-[7px] text-zinc-800 uppercase font-black tracking-widest">
                HallyTrack System
              </p>
              <p className="text-[7px] text-zinc-900 uppercase font-black">
                Secure Node v4.2.0
              </p>
            </div>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `,
        }}
      />
    </div>
  );
};

export default Login;
