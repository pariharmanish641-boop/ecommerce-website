"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Leaf, LockKeyhole } from "lucide-react";
import { useState, type FormEvent } from "react";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: mode,
          name: formData.get("name"),
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message ?? "We could not sign you in.");
      }

      const requestedDestination = new URLSearchParams(window.location.search).get(
        "next",
      );
      const destination =
        requestedDestination?.startsWith("/") &&
        !requestedDestination.startsWith("//")
          ? requestedDestination
          : "/";
      window.location.assign(destination);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "We could not sign you in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="account-page">
      <div className="account-card">
        <Link href="/" className="account-back">
          <ArrowLeft size={15} /> Back to Nook
        </Link>
        <div className="account-brand">
          <span className="account-brand-icon">
            <Leaf size={21} />
          </span>
          nook<span className="brand-dot">.</span>
        </div>
        <p className="eyebrow">A little closer to home</p>
        <h1>{mode === "login" ? "Welcome back." : "Make yourself at home."}</h1>
        <p className="account-description">
          {mode === "login"
            ? "Sign in to pick up where you left off and keep your good finds close."
            : "Create an account to save your details and keep track of your orders."}
        </p>

        <div className="account-tabs" role="tablist" aria-label="Account options">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "login"}
            onClick={() => {
              setMode("login");
              setError("");
            }}
          >
            Sign in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "signup"}
            onClick={() => {
              setMode("signup");
              setError("");
            }}
          >
            Create account
          </button>
        </div>

        <form className="account-form" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <label>
              <span>Your name</span>
              <input
                name="name"
                type="text"
                autoComplete="name"
                minLength={2}
                maxLength={100}
                placeholder="How should we call you?"
                required
              />
            </label>
          )}
          <label>
            <span>Email address</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              maxLength={254}
              placeholder="you@example.com"
              required
            />
          </label>
          <label>
            <span>Password</span>
            <span className="password-input">
              <input
                name="password"
                type={isPasswordVisible ? "text" : "password"}
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                minLength={8}
                maxLength={128}
                placeholder="At least 8 characters"
                required
              />
              <button
                type="button"
                aria-label={
                  isPasswordVisible ? "Hide password" : "Show password"
                }
                onClick={() => setIsPasswordVisible((visible) => !visible)}
              >
                {isPasswordVisible ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </span>
          </label>
          {error && (
            <p className="account-error" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="account-submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "One moment…"
              : mode === "login"
                ? "Sign in"
                : "Create account"}
            {!isSubmitting && <ArrowRight size={16} />}
          </button>
        </form>
        <p className="account-security">
          <LockKeyhole size={14} />
          Your password is securely hashed and never stored in plain text.
        </p>
        <Link href="/request" className="account-help-link">
          Looking for something special? Make a custom request.
        </Link>
      </div>
      <aside className="account-visual">
        <div className="account-visual-shade" />
        <p>Find your kind of lovely.</p>
        <span>Thoughtfully found. Happily kept.</span>
      </aside>
    </main>
  );
}
