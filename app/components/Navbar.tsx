"use client";

import Link from "next/link";
import { ArrowRight, Search, ShoppingBag, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "./CartProvider";

export default function Navbar() {
  const { itemCount } = useCart();
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/auth", { signal: controller.signal, cache: "no-store" })
      .then((response) => setIsSignedIn(response.ok))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          console.error("Could not check the current account session.", error);
        }
      });
    return () => controller.abort();
  }, []);

  return (
    <div className="site-header-wrap">
      <div className="announcement-bar">
        <span>Good things, closer to home.</span>
        <span className="announcement-divider">✳</span>
        <span>Free delivery on orders over ₹1,499</span>
      </div>
      <header className="site-header">
        <nav aria-label="Main navigation" className="site-nav">
          <Link href="/" className="brand-mark" aria-label="Nook home">
            nook<span className="brand-dot">.</span>
          </Link>
          <div className="desktop-nav-links">
            <Link href="#categories">Discover</Link>
            <Link href="#products">Shop all</Link>
            <Link href="/about">Our story</Link>
            <Link href="/request">Custom request</Link>
            <Link href="/account">My orders</Link>
          </div>
          <div className="nav-actions">
            <Link
              href="/#products"
              aria-label="Search products"
              className="nav-search"
            >
              <Search size={19} />
            </Link>
            <Link
              href={isSignedIn ? "/account" : "/login"}
              aria-label={isSignedIn ? "My account" : "Sign in"}
              className="nav-account"
            >
              <UserRound size={18} />
              <span>{isSignedIn ? "My account" : "Sign in"}</span>
            </Link>
            <Link href="/checkout" className="cart-link">
              <ShoppingBag size={17} />
              <span>Bag</span>
              <span className="cart-count">{itemCount}</span>
              <ArrowRight size={14} className="cart-arrow" />
            </Link>
          </div>
        </nav>
      </header>
    </div>
  );
}
