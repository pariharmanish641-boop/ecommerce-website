"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, LockKeyhole, Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useCart } from "../components/CartProvider";
import ProductImage from "../components/ProductImage";

const formatPrice = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

type SavedOrder = {
  id: string;
  totalAmount: number;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, setQuantity, removeFromCart, clearCart } = useCart();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [savedOrder, setSavedOrder] = useState<SavedOrder | null>(null);

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    const controller = new AbortController();
    async function checkAuth() {
      try {
        const response = await fetch("/api/auth", {
          signal: controller.signal,
          cache: "no-store",
        });
        if (response.status === 401) {
          router.replace("/login?next=%2Fcheckout");
        } else if (!response.ok) {
          setError("We could not verify your account. Please try again.");
        }
      } catch (authError) {
        if (!controller.signal.aborted) {
          console.error("Could not verify checkout session.", authError);
          setError("We could not verify your account. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) setIsCheckingAuth(false);
      }
    }
    void checkAuth();
    return () => controller.abort();
  }, [items.length, router]);

  const tax = Math.round(subtotal * 0.05);
  const shipping = subtotal >= 1499 || subtotal === 0 ? 0 : 99;
  const total = subtotal + tax + shipping;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
          paymentMethod: formData.get("paymentMethod"),
          shippingAddress: {
            fullName: formData.get("fullName"),
            phone: formData.get("phone"),
            addressLine1: formData.get("addressLine1"),
            addressLine2: formData.get("addressLine2"),
            city: formData.get("city"),
            state: formData.get("state"),
            postalCode: formData.get("postalCode"),
            country: "India",
          },
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          router.replace("/login?next=%2Fcheckout");
          return;
        }
        throw new Error(result.message ?? "We could not place your order.");
      }

      setSavedOrder(result.order);
      clearCart();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "We could not place your order. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (savedOrder) {
    return (
      <main className="checkout-shell">
        <section className="checkout-success">
          <span className="checkout-success-icon">✓</span>
          <p className="eyebrow">Order saved</p>
          <h1>Thanks for shopping with us.</h1>
          <p>
            Your order is now saved to your account and MongoDB. Payment is not
            processed by this demo.
          </p>
          <div className="order-reference">
            <span>Order reference</span>
            <strong>{savedOrder.id}</strong>
          </div>
          <p className="checkout-total">Total {formatPrice(savedOrder.totalAmount)}</p>
          <Link href="/" className="checkout-primary">
            Back to the marketplace <ArrowRight size={16} />
          </Link>
        </section>
      </main>
    );
  }

  if (isCheckingAuth && items.length > 0) {
    return (
      <main className="checkout-shell">
        <p className="checkout-loading">Checking your account…</p>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="checkout-shell">
        <section className="checkout-empty">
          <span className="eyebrow">Almost home</span>
          <h1>Your bag is waiting.</h1>
          <p>Find a thoughtful little something in the Nook collection.</p>
          <Link href="/" className="checkout-primary">
            Browse the marketplace <ArrowRight size={16} />
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-shell">
      <div className="checkout-heading">
        <Link href="/" className="checkout-back">
          <ArrowLeft size={15} /> Continue shopping
        </Link>
        <span className="eyebrow">A little closer to home</span>
        <h1>Your checkout.</h1>
        <p>One last step before your good finds make their way to you.</p>
      </div>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <section className="checkout-form-section">
            <h2>Delivery details</h2>
            <p>Tell us where to bring your order.</p>
            <div className="checkout-fields">
              <label>
                <span>Full name</span>
                <input name="fullName" autoComplete="name" required />
              </label>
              <label>
                <span>Mobile number</span>
                <input
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  minLength={8}
                  maxLength={20}
                  required
                />
              </label>
              <label className="checkout-field-wide">
                <span>Society / address</span>
                <input
                  name="addressLine1"
                  autoComplete="address-line1"
                  placeholder="Society, sector and street"
                  required
                />
              </label>
              <label className="checkout-field-wide">
                <span>Apartment / landmark (optional)</span>
                <input
                  name="addressLine2"
                  autoComplete="address-line2"
                  placeholder="Tower, flat or nearby landmark"
                />
              </label>
              <label>
                <span>City</span>
                <input name="city" autoComplete="address-level2" required />
              </label>
              <label>
                <span>State</span>
                <input name="state" autoComplete="address-level1" required />
              </label>
              <label>
                <span>PIN code</span>
                <input
                  name="postalCode"
                  autoComplete="postal-code"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  minLength={6}
                  maxLength={6}
                  required
                />
              </label>
            </div>
          </section>

          <section className="checkout-form-section">
            <h2>Payment preference</h2>
            <p>Choose a demo payment option. No payment is collected.</p>
            <div className="payment-options">
              <label>
                <input type="radio" name="paymentMethod" value="upi" required />
                <span>UPI</span>
              </label>
              <label>
                <input type="radio" name="paymentMethod" value="card" />
                <span>Credit / debit card</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  defaultChecked
                />
                <span>Cash on delivery</span>
              </label>
            </div>
          </section>

          {error && (
            <p className="checkout-error" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="checkout-primary checkout-place-order"
          >
            {isSubmitting ? "Saving your order…" : "Place order"}
            {!isSubmitting && <ArrowRight size={16} />}
          </button>
          <p className="checkout-secure">
            <LockKeyhole size={13} />
            Your account is required. Payment details are not collected.
          </p>
        </form>

        <aside className="checkout-summary">
          <h2>Your bag</h2>
          <ul className="checkout-items">
            {items.map((item) => (
              <li key={item.id} className="checkout-item">
                <div className="checkout-product-image">
                  <ProductImage
                    src={item.image}
                    alt=""
                    sizes="72px"
                    className="object-cover"
                  />
                </div>
                <div className="checkout-product-copy">
                  <h3>{item.name}</h3>
                  <span>{formatPrice(item.price)}</span>
                  <div className="checkout-quantity">
                    <button
                      type="button"
                      aria-label={`Decrease ${item.name} quantity`}
                      onClick={() => setQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus size={13} />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      aria-label={`Increase ${item.name} quantity`}
                      onClick={() => setQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus size={13} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${item.name} from bag`}
                      onClick={() => removeFromCart(item.id)}
                      className="checkout-remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <strong>{formatPrice(item.price * item.quantity)}</strong>
              </li>
            ))}
          </ul>
          <div className="checkout-totals">
            <div>
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div>
              <span>Estimated tax (5%)</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div>
              <span>Delivery</span>
              <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
            <div className="checkout-grand-total">
              <strong>Total</strong>
              <strong>{formatPrice(total)}</strong>
            </div>
          </div>
          <p className="checkout-delivery-note">
            {subtotal >= 1499
              ? "Your order ships free. Lovely."
              : `Add ${formatPrice(1499 - subtotal)} for free delivery.`}
          </p>
        </aside>
      </div>
    </main>
  );
}
