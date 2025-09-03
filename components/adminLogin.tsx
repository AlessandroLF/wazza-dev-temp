"use client";
import { useState } from "react";
import styles from "./AdminLogin.module.css";

export default function AdminLogin({ userId, onSuccess }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSignIn() {
    if (!password || submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch("https://dev-api-front.wazzap.me/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ id: userId, password }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json || json.code !== 200 || !json.jwt) {
        console.error("Login failed:", json);
        return;
      }

      // persist userId + jwt
      try {
        localStorage.setItem("wazzap_auth", JSON.stringify({ userId, jwt: json.jwt }));
      } catch {
        // ignore storage errors
      }

      // pass full payload up
      onSuccess?.({ jwt: json.jwt, data: json.data });

      // close panel
      setOpen(false);
    } catch (err) {
      console.error("Login error:", err);
    } finally {
      setSubmitting(false);
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    handleSignIn();
  }


  return (
    <div className={styles.root}>
      {!open ? (
        <button className={styles.btnSignin} onClick={() => setOpen(true)}>
          Sign In
        </button>
      ) : (
        <div className={styles.panel}>
        <div className={styles.header}>
          <h2>Sign In</h2>
          <button className={styles.close} onClick={() => setOpen(false)}>
            &times;
          </button>
        </div>

        <div className={styles.sep} />

        <form onSubmit={onSubmit}>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className={styles.continue}
            disabled={submitting || !password}
          >
            {submitting ? "Checking..." : "Continue"}
          </button>
        </form>
      </div>
      )}
    </div>
  );
}