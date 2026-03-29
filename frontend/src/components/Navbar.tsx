import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-20 border-b border-black/10 bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div>
          <p className="font-heading text-xl text-ink">Incubation Hub</p>
          <p className="text-sm text-ink/70">Build ideas with aligned teams</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="rounded-full border border-accent/20 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
            {user?.role}
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-black"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
