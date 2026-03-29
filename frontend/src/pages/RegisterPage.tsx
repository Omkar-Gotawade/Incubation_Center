import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { UserRole } from "../types";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>("business");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await register({ name, email, password, role });
      navigate("/login", { replace: true });
    } catch {
      setError("Registration failed. Please verify your details.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas px-4 py-8">
      <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-warm/25 blur-3xl" />

      <form onSubmit={onSubmit} className="z-10 w-full max-w-md rounded-2xl border border-black/10 bg-white/90 p-8 shadow-glow">
        <h1 className="font-heading text-3xl text-ink">Create Account</h1>
        <p className="mt-1 text-sm text-ink/70">Join your incubation team with a role-based account.</p>

        <div className="mt-6 space-y-4">
          <label className="block text-sm font-semibold text-ink">
            Name
            <input
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2 outline-none ring-accent focus:ring"
            />
          </label>

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
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 pr-20 outline-none ring-accent focus:ring"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-semibold text-ink/70 hover:bg-black/5"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          <label className="block text-sm font-semibold text-ink">
            Role
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as UserRole)}
              className="mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2 outline-none ring-accent focus:ring"
            >
              <option value="admin">Admin</option>
              <option value="prototyper">Prototyper</option>
              <option value="business">Business</option>
            </select>
          </label>

          {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-accent px-4 py-2.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Creating account..." : "Register"}
          </button>
        </div>

        <p className="mt-5 text-sm text-ink/70">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
