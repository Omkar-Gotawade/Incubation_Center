import { FormEvent, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { resetPassword } from "../api/auth";

function useResetToken(): string {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search).get("token") ?? "", [search]);
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const token = useResetToken();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Invalid reset link. Please request a new one.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await resetPassword({ token, new_password: newPassword });
      setMessage(result.message);
      setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch {
      setError("Reset link is invalid or expired.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas px-4 py-8">
      <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-warm/25 blur-3xl" />

      <form onSubmit={onSubmit} className="z-10 w-full max-w-md rounded-2xl border border-black/10 bg-white/90 p-8 shadow-glow">
        <h1 className="font-heading text-3xl text-ink">Reset Password</h1>
        <p className="mt-1 text-sm text-ink/70">Set a new password for your account.</p>

        <div className="mt-6 space-y-4">
          <label className="block text-sm font-semibold text-ink">
            New Password
            <div className="relative mt-1">
              <input
                type={showNewPassword ? "text" : "password"}
                required
                minLength={8}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 pr-20 outline-none ring-accent focus:ring"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((value) => !value)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-semibold text-ink/70 hover:bg-black/5"
              >
                {showNewPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          <label className="block text-sm font-semibold text-ink">
            Confirm Password
            <div className="relative mt-1">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 pr-20 outline-none ring-accent focus:ring"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-semibold text-ink/70 hover:bg-black/5"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
          {message ? <p className="text-sm font-semibold text-accent">{message}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-accent px-4 py-2.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Updating..." : "Update Password"}
          </button>
        </div>

        <p className="mt-5 text-sm text-ink/70">
          Back to{" "}
          <Link to="/login" className="font-semibold text-accent hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
