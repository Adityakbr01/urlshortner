import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password, confirm);
      await navigate("/");
    } catch {
      setError("Could not create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-xl border border-outline bg-surface shadow-md md:grid-cols-2">
      <div className="hidden flex-col justify-between bg-inverse-surface p-10 text-inverse-on-surface md:flex">
        <div>
          <p className="font-display text-2xl font-semibold">
            Short<span className="text-primary">ly</span>
          </p>
          <h1 className="mt-8 font-display text-[42px] font-light leading-[50px] tracking-tight">
            One dashboard.
            <br />
            Every link.
            <br />
            <span className="text-primary">Zero clutter.</span>
          </h1>
          <p className="mt-4 max-w-sm text-[16px] leading-6 text-inverse-on-surface/70">
            Join ambitious operators shortening 1,200+ links a month with clean
            analytics and instant redirects.
          </p>
        </div>
        <div className="flex gap-2">
          <span className="badge">Free plan</span>
          <span className="badge !bg-secondary-container !text-on-secondary-container">
            No card required
          </span>
        </div>
      </div>

      <div className="bg-surface-container-low p-8 sm:p-10">
        <h2 className="font-display text-3xl font-medium">Create account</h2>
        <p className="mt-1 text-[16px] text-on-surface-variant">
          Start shortening links in under a minute.
        </p>

        <form onSubmit={(e) => void submit(e)} className="mt-8 space-y-4">
          <div>
            <label className="mb-1 block font-display text-[14px] font-semibold tracking-wide">
              Name
            </label>
            <input
              className="input-field"
              required
              placeholder="Aarav Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            <div>
              <label className="mb-1 block font-display text-[14px] font-semibold tracking-wide">
                Confirm
              </label>
              <input
                className="input-field"
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <p className="rounded-md border border-error-container bg-error-container/20 px-3 py-2 text-sm text-error">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Creating account…" : "Sign up"}
          </button>
        </form>

        <div className="divider" />

        <p className="text-center text-[14px] text-on-surface-variant">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
