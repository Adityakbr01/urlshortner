import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      await navigate("/");
    } catch {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-xl border border-outline bg-surface shadow-md md:grid-cols-2">
      {/* Brand panel */}
      <div className="hidden flex-col justify-between bg-inverse-surface p-10 text-inverse-on-surface md:flex">
        <div>
          <p className="font-display text-2xl font-semibold">
            Short<span className="text-primary">ly</span>
          </p>
          <h1 className="mt-8 font-display text-[42px] font-light leading-[50px] tracking-tight">
            Shorten links.
            <br />
            Track clicks.
            <br />
            <span className="text-primary">Grow faster.</span>
          </h1>
          <p className="mt-4 max-w-sm text-[16px] leading-6 text-inverse-on-surface/70">
            Your AI Insights dashboard shows every click in real time — here is how
            to convert that engagement into repeat visits.
          </p>
        </div>
        <div className="flex gap-2">
          <span className="badge">360 links shortened</span>
          <span className="badge !bg-secondary-container !text-on-secondary-container">
            95% uptime
          </span>
        </div>
      </div>

      {/* Form */}
      <div className="bg-surface-container-low p-8 sm:p-10">
        <h2 className="font-display text-3xl font-medium">Welcome back</h2>
        <p className="mt-1 text-[16px] text-on-surface-variant">
          Log in to manage your short links.
        </p>

        <form onSubmit={(e) => void submit(e)} className="mt-8 space-y-4">
          <div>
            <label className="mb-1 block font-display text-[14px] font-semibold tracking-wide">
              Email
            </label>
            <input
              className="input-field"
              type="email"
              required
              placeholder="you@brand.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block font-display text-[14px] font-semibold tracking-wide">
              Password
            </label>
            <input
              className="input-field"
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="rounded-md border border-error-container bg-error-container/20 px-3 py-2 text-sm text-error">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <div className="divider" />

        <p className="text-center text-[14px] text-on-surface-variant">
          New here?{" "}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
