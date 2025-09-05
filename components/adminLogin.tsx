"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import styles from "./adminLogin.module.css";
import WazzapFace from "./wazzapFace";
import { apiAdminLogin } from "@/lib/api/admin";

type AdminLoginProps = {
  userId: string;
  onSuccess?: (payload: { jwt: string; data?: unknown }) => void;
};

export default function AdminLogin({ userId, onSuccess }: AdminLoginProps) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const handleSignIn = useCallback(async () => {
  if (!password || submitting) return;
  setSubmitting(true);
  setError(null);

  try {
    const { ok, json } = await apiAdminLogin({ userId, password });

    // invalid creds / server error
    if (!ok || !json || json.code !== 200 || !json.jwt) {
      setError("Invalid password or server error. Please try again.");
      console.error("Login failed:", json);
      return; // <-- we still hit finally below
    }

    // success: persist and close
    try {
      localStorage.setItem(
        "wazzap_auth",
        JSON.stringify({ userId, jwt: json.jwt })
      );
    } catch {}

    onSuccess?.({ jwt: json.jwt, data: json.data });
    setOpen(false);
    setPassword("");
  } catch (err) {
    console.error("Login error:", err);
    setError("Network error. Check your connection and try again.");
  } finally {
    // ALWAYS re-enable the button
    setSubmitting(false);
  }
}, [password, submitting, userId, onSuccess]);


  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void handleSignIn();
  }

  return (
    <div className={styles.root}>
      <WazzapFace className={styles.logo} />
      {!open ? (
        <button
          className={styles.btnSignin}
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded="false"
        >
          Sign In
        </button>
      ) : (
        <div
          className={styles.panel}
          role="dialog"
          aria-modal="true"
          aria-labelledby="signin-title"
        >
          <div className={styles.header}>
            <h2 id="signin-title">Sign In</h2>
            <button
              className={styles.close}
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              &times;
            </button>
          </div>

          <div className={styles.sep} />

          <form onSubmit={onSubmit} className={styles.form}>
            <label className={styles.label}>
              <span className={styles.labelText}>Password</span>
              <div className={styles.inputRow}>
                <input
                  ref={inputRef}
                  type={showPw ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  aria-invalid={!!error}
                  aria-describedby={error ? "signin-error" : undefined}
                />
                <button
                  type="button"
                  className={styles.togglePw}
                  onClick={() => setShowPw((s) => !s)}
                  aria-pressed={showPw}
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            {error && (
              <div id="signin-error" className={styles.error} role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              className={styles.continue}
              disabled={submitting || !password}
            >
              <span className={styles.btnLabel}>
                {submitting ? "Checking…" : "Continue"}
              </span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
