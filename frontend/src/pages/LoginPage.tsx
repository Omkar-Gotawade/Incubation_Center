import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login({ email, password });
      navigate("/dashboard", { replace: true });
    } catch {
      setError("Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas px-4 py-8">
      <div className="absolute -top-28 -left-16 h-72 w-72 rounded-full bg-warm/20 blur-3xl" />
      <div className="absolute -right-14 bottom-0 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />

      <form onSubmit={onSubmit} className="z-10 w-full max-w-md rounded-2xl border border-black/10 bg-white/90 p-8 shadow-glow">
        <h1 className="font-heading text-3xl text-ink">Welcome Back</h1>
        <p className="mt-1 text-sm text-ink/70">Sign in to your incubation workspace.</p>

        <div className="mt-6 space-y-4">
          <label className="block text-sm font-semibold text-ink">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2 outline-none ring-accent focus:ring"
            />
          </label>

          <label className="block text-sm font-semibold text-ink">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2 outline-none ring-accent focus:ring"
            />
          </label>

          {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-ink px-4 py-2.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Login"}
          </button>
        </div>

        <p className="mt-5 text-sm text-ink/70">
          New here?{" "}
          <Link to="/register" className="font-semibold text-accent hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}
