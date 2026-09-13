import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-dim font-body text-on-surface">
      <header className="sticky top-0 z-10 border-b border-outline bg-surface/90 backdrop-blur">
        <div className="container-app flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-on-primary shadow-primary">
              S
            </span>
            <span className="font-display text-xl font-semibold tracking-tight">
              Short<span className="text-primary">ly</span>
            </span>
          </Link>

          <nav className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="hidden text-sm text-on-surface-variant sm:block">
                  {user?.name}
                </span>
                <span className="badge">PRO</span>
                <button
                  onClick={() => void logout()}
                  className="btn-secondary !h-10 !px-5 !py-2 text-[13px]"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => void navigate("/login")}
                  className="btn-secondary !h-10 !px-5 !py-2 text-[13px]"
                >
                  Log in
                </button>
                <button onClick={() => void navigate("/register")} className="btn-primary !h-10 !px-5 !py-2 text-[13px]">
                  Sign up
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="container-app py-10">{children}</main>

      <footer className="border-t border-outline bg-surface">
        <div className="container-app flex flex-col items-center justify-between gap-2 py-6 text-sm text-on-surface-variant sm:flex-row">
          <p className="font-display font-semibold text-on-surface">
            Short<span className="text-primary">ly</span>
            <span className="ml-2 font-body font-normal text-on-surface-variant">
              Shorten, share, track.
            </span>
          </p>
          <p>Built with Laravel + React Query</p>
        </div>
      </footer>
    </div>
  );
}
