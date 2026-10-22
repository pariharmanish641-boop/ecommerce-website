"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { useState, type FormEvent } from "react";

export default function CustomRequestPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [requestId, setRequestId] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const form = event.currentTarget;

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: data.get("userName"),
          email: data.get("email"),
          itemDetails: data.get("itemDetails"),
          budget: data.get("budget"),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message ?? "Your request could not be sent.");
      }
      setRequestId(result.requestId);
      form.reset();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Your request could not be sent. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (requestId) {
    return (
      <main className="request-page">
        <section className="request-success">
          <CheckCircle2 size={42} />
          <span className="eyebrow">Request received</span>
          <h1>We’ll keep an eye out.</h1>
          <p>
            Your request is saved. Keep this reference if you need to follow up:
          </p>
          <strong>{requestId}</strong>
          <Link href="/" className="request-submit">
            Back to Nook <ArrowRight size={16} />
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="request-page">
      <section className="request-card">
        <Link href="/" className="account-back">
          <ArrowLeft size={15} /> Back to Nook
        </Link>
        <span className="eyebrow">
          <Sparkles size={14} /> Tell us what you’re looking for
        </span>
        <h1>Can’t find it? We’ll look.</h1>
        <p className="account-description">
          Share a few details and our team will see if we can track down just
          the right thing.
        </p>
        <form className="account-form" onSubmit={handleSubmit}>
          <label>
            <span>Your name</span>
            <input
              name="userName"
              autoComplete="name"
              minLength={2}
              maxLength={100}
              required
              placeholder="Your name"
            />
          </label>
          <label>
            <span>Email address</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              maxLength={254}
              required
              placeholder="you@example.com"
            />
          </label>
          <label>
            <span>What are you hoping to find?</span>
            <textarea
              name="itemDetails"
              minLength={10}
              maxLength={3000}
              rows={5}
              required
              placeholder="Tell us about the item, size, colour, style, or any details that matter."
            />
          </label>
          <label>
            <span>Budget in rupees (optional)</span>
            <input
              name="budget"
              type="number"
              min="0"
              max="10000000"
              step="1"
              placeholder="₹"
            />
          </label>
          {error && (
            <p className="account-error" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="request-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending…" : "Send my request"}
            {!isSubmitting && <ArrowRight size={16} />}
          </button>
        </form>
      </section>
    </main>
  );
}
