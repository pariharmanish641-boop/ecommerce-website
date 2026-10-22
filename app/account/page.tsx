"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, PackageCheck } from "lucide-react";
import { useEffect, useState } from "react";

type CustomerOrder = {
  _id: string;
  items: Array<{ title: string; quantity: number; unitPrice: number }>;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
};

const formatPrice = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export default function AccountPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function loadOrders() {
      try {
        const response = await fetch("/api/orders", {
          signal: controller.signal,
          cache: "no-store",
        });
        if (response.status === 401) {
          router.replace("/login?next=%2Faccount");
          return;
        }
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message ?? "Orders could not be loaded.");
        }
        setOrders(result.orders);
      } catch (loadError) {
        if (!controller.signal.aborted) {
          console.error("Could not load account orders.", loadError);
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Orders could not be loaded.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }
    void loadOrders();
    return () => controller.abort();
  }, [router]);

  return (
    <main className="checkout-shell account-orders-page">
      <div className="checkout-heading">
        <div className="account-heading-row">
          <span className="eyebrow">Your Nook</span>
          <button
            type="button"
            className="account-signout"
            disabled={isSigningOut}
            onClick={async () => {
              setIsSigningOut(true);
              try {
                const response = await fetch("/api/auth", { method: "DELETE" });
                if (!response.ok) {
                  throw new Error("We could not sign you out.");
                }
                router.replace("/");
              } catch (signOutError) {
                setError(
                  signOutError instanceof Error
                    ? signOutError.message
                    : "We could not sign you out.",
                );
                setIsSigningOut(false);
              }
            }}
          >
            {isSigningOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
        <h1>Your orders.</h1>
        <p>All your good finds, gathered in one place.</p>
      </div>
      {isLoading ? (
        <p className="checkout-loading">Finding your orders…</p>
      ) : error ? (
        <p className="checkout-error" role="alert">
          {error}
        </p>
      ) : orders.length ? (
        <div className="account-order-list">
          {orders.map((order) => (
            <article className="account-order-card" key={order._id}>
              <div className="account-order-header">
                <span className="account-order-icon">
                  <PackageCheck size={19} />
                </span>
                <div>
                  <strong>Order {order._id.slice(-8).toUpperCase()}</strong>
                  <span>
                    {new Intl.DateTimeFormat("en-IN", {
                      dateStyle: "medium",
                    }).format(new Date(order.createdAt))}
                  </span>
                </div>
                <span className="account-order-status">{order.status}</span>
              </div>
              <ul>
                {order.items.map((item) => (
                  <li key={`${order._id}-${item.title}`}>
                    <span>
                      {item.title} <small>× {item.quantity}</small>
                    </span>
                    <strong>{formatPrice(item.unitPrice * item.quantity)}</strong>
                  </li>
                ))}
              </ul>
              <div className="account-order-total">
                <span>
                  Total · payment {order.paymentStatus}
                </span>
                <strong>{formatPrice(order.totalAmount)}</strong>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="checkout-empty">
          <PackageCheck size={28} />
          <h2>No orders just yet.</h2>
          <p>Your next favourite might be just around the corner.</p>
          <Link href="/" className="checkout-primary">
            Browse the marketplace <ArrowRight size={16} />
          </Link>
        </section>
      )}
    </main>
  );
}
