"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Minus, Plus, ShoppingBag, Star, Truck } from "lucide-react";
import { useEffect, useState, Suspense } from "react";
import ProductImage from "@/app/components/ProductImage";
import { useCart } from "@/app/components/CartProvider";

type Product = {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
  images?: string[];
  stock?: number;
  rating?: number;
  ratingCount?: number;
  tags?: string[];
};

const money = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

function ProductDetailContent() {
  const params = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const productId = params?.id;

  useEffect(() => {
    if (!productId) return;
    const controller = new AbortController();
    async function loadProduct() {
      try {
        const response = await fetch(`/api/products/${encodeURIComponent(productId)}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message ?? "Product could not be found.");
        }
        setProduct(result);
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Product could not be loaded.",
          );
        }
      }
    }
    void loadProduct();
    return () => controller.abort();
  }, [productId]);

  if (error) {
    return (
      <main className="product-detail-shell">
        <Link href="/" className="checkout-back">
          <ArrowLeft size={15} /> Back to the marketplace
        </Link>
        <section className="product-detail-error" role="alert">
          <h1>We couldn’t find that one.</h1>
          <p>{error}</p>
          <Link href="/" className="checkout-primary">
            Explore the collection <ArrowRight size={16} />
          </Link>
        </section>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="product-detail-shell">
        <div className="product-detail-skeleton" aria-label="Loading product" />
      </main>
    );
  }

  const isInStock = typeof product.stock !== "number" || product.stock > 0;
  const image = product.images?.[0] || product.image;

  return (
    <main className="product-detail-shell">
      <Link href="/" className="checkout-back">
        <ArrowLeft size={15} /> Back to the marketplace
      </Link>
      <div className="product-detail-layout">
        <div className="product-detail-photo">
          <ProductImage
            src={image}
            alt={product.title}
            sizes="(max-width: 720px) 100vw, 50vw"
            className="product-detail-image"
          />
        </div>
        <section className="product-detail-copy">
          <span className="eyebrow">{product.category}</span>
          <h1>{product.title}</h1>
          <div className="product-detail-rating">
            <Star size={15} fill="currentColor" />
            {typeof product.rating === "number"
              ? `${product.rating.toFixed(1)} (${product.ratingCount ?? 0} reviews)`
              : "A fresh find"}
          </div>
          <p className="product-detail-price">{money(product.price)}</p>
          <p className="product-detail-description">{product.description}</p>
          <div className="product-detail-stock">
            <Check size={15} />
            {isInStock
              ? typeof product.stock === "number"
                ? `${product.stock} available`
                : "Available to order"
              : "Currently out of stock"}
          </div>
          <div className="product-detail-actions">
            <div className="detail-quantity">
              <button
                type="button"
                aria-label="Decrease quantity"
                disabled={quantity <= 1}
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              >
                <Minus size={14} />
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                disabled={
                  typeof product.stock === "number" &&
                  quantity >= product.stock
                }
                onClick={() =>
                  setQuantity((value) =>
                    Math.min(
                      typeof product.stock === "number" ? product.stock : 20,
                      value + 1,
                    ),
                  )
                }
              >
                <Plus size={14} />
              </button>
            </div>
            <button
              type="button"
              className="checkout-primary detail-add-button"
              disabled={!isInStock}
              onClick={() => {
                for (let index = 0; index < quantity; index += 1) {
                  addToCart({
                    id: product._id,
                    name: product.title,
                    price: product.price,
                    image,
                  });
                }
                setAdded(true);
              }}
            >
              <ShoppingBag size={16} />
              {added ? "Added to your bag" : "Add to bag"}
            </button>
          </div>
          {added && (
            <Link href="/checkout" className="product-detail-checkout">
              Go to bag <ArrowRight size={14} />
            </Link>
          )}
          <div className="product-detail-perks">
            <span>
              <Truck size={16} /> Free delivery over ₹1,499
            </span>
            <span>
              <Check size={16} /> Secure checkout
            </span>
          </div>
          {product.tags && product.tags.length > 0 && (
            <div className="product-detail-tags">
              {product.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense
      fallback={
        <main className="product-detail-shell">
          <div className="product-detail-skeleton" aria-label="Loading product" />
        </main>
      }
    >
      <ProductDetailContent />
    </Suspense>
  );
}