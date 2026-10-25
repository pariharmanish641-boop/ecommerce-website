"use client";

import Link from "next/link";
import ProductImage from "./components/ProductImage";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  Heart,
  Leaf,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { sampleProducts, type SampleProduct } from "@/lib/sample-products";
import { useCart } from "./components/CartProvider";

type Product = Omit<SampleProduct, "rating" | "stock"> & {
  rating: number | null;
  stock: number | null;
};

const categories = [
  {
    name: "Clothing",
    note: "Made for every day",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=85",
  },
  {
    name: "Home",
    note: "Find your feeling",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=85",
  },
  {
    name: "Accessories",
    note: "The little details",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=85",
  },
  {
    name: "Footwear",
    note: "Step into something good",
    image:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=85",
  },
];

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function matchesSearch(product: Product, search: string) {
  const searchSynonyms: Record<string, string[]> = {
    casual: ["casual", "everyday", "clothing"],
    clothes: ["clothes", "clothing", "apparel", "shirt", "dress"],
    outfit: ["outfit", "clothing", "apparel", "shirt", "dress"],
    summer: ["summer", "linen", "lightweight", "cotton"],
    wear: ["wear", "clothing", "apparel", "shirt", "dress"],
  };
  const budgetMatch = search.match(
    /(?:under|below|less than)\s*(?:₹|rs\.?\s*)?([\d,]+)/i,
  );
  const maximumPrice = budgetMatch
    ? Number(budgetMatch[1].replaceAll(",", ""))
    : undefined;
  const keywords = search
    .replace(/(?:under|below|less than)\s*(?:₹|rs\.?\s*)?[\d,]+/i, "")
    .replace(/[₹,]/g, "")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(
      (word) =>
        word.length > 1 &&
        ![
          "a",
          "an",
          "the",
          "for",
          "with",
          "me",
          "please",
          "recommend",
          "show",
          "suggest",
        ].includes(word),
    );
  const searchGroups = keywords.map(
    (word) => searchSynonyms[word] ?? [word],
  );
  const searchableText = [
    product.title,
    product.description,
    product.category,
    ...product.tags,
  ]
    .join(" ")
    .toLowerCase();

  return (
    (maximumPrice === undefined || product.price <= maximumPrice) &&
    searchGroups.every((group) =>
      group.some((term) => searchableText.includes(term)),
    )
  );
}

function normalizeProduct(value: unknown, index: number): Product {
  if (typeof value !== "object" || value === null) {
    throw new Error("The product catalog contains an invalid product.");
  }

  const product = value as Record<string, unknown>;
  if (
    typeof product.title !== "string" ||
    typeof product.description !== "string" ||
    typeof product.price !== "number" ||
    typeof product.category !== "string" ||
    typeof product.image !== "string"
  ) {
    throw new Error("The product catalog contains an incomplete product.");
  }

  return {
    _id: typeof product._id === "string" ? product._id : `product-${index}`,
    title: product.title,
    description: product.description,
    price: product.price,
    category: product.category,
    image: product.image,
    images: Array.isArray(product.images)
      ? product.images.filter((image): image is string => typeof image === "string")
      : [product.image],
    stock: typeof product.stock === "number" ? product.stock : null,
    rating: typeof product.rating === "number" ? product.rating : null,
    ratingCount:
      typeof product.ratingCount === "number" ? product.ratingCount : 0,
    tags: Array.isArray(product.tags)
      ? product.tags.filter((tag): tag is string => typeof tag === "string")
      : [],
    badge: typeof product.badge === "string" ? product.badge : "",
    isFeatured: product.isFeatured === true,
  };
}

function ProductCard({
  product,
  index,
  onAdd,
}: {
  product: Product;
  index: number;
  onAdd: (product: Product) => void;
}) {
  const [isSaved, setIsSaved] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.42, delay: (index % 4) * 0.06 }}
      className="product-card group"
    >
      <div className="product-image-wrap">
        <ProductImage
          src={product.image}
          alt={product.title}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="product-image"
        />
        {product.badge && <span className="product-badge">{product.badge}</span>}
        <button
          type="button"
          aria-label={isSaved ? `Remove ${product.title} from saved items` : `Save ${product.title}`}
          aria-pressed={isSaved}
          onClick={() => setIsSaved((saved) => !saved)}
          className={`save-button ${isSaved ? "is-saved" : ""}`}
        >
          <Heart size={17} fill={isSaved ? "currentColor" : "none"} />
        </button>
        <button
          type="button"
          onClick={() => onAdd(product)}
          disabled={product.stock !== null && product.stock < 1}
          className="quick-add"
        >
          <ShoppingBag size={15} />
          {product.stock === null || product.stock > 0
            ? "Add to bag"
            : "Sold out"}
        </button>
      </div>
      <div className="product-info">
        <div className="product-meta">
          <span>{product.category}</span>
          <span className="rating">
            {product.rating === null ? (
              <span>New</span>
            ) : (
              <>
                <Star size={13} fill="currentColor" />
                {product.rating.toFixed(1)}
                <span className="rating-count">({product.ratingCount})</span>
              </>
            )}
          </span>
        </div>
        <h3>
          <Link href={`/products/${product._id}`}>{product.title}</Link>
        </h3>
        <p className="product-description">{product.description}</p>
        <div className="product-price-row">
          <span className="product-price">{money.format(product.price)}</span>
          <span className="stock-note">
            {product.stock === null
              ? "In stock"
              : product.stock > 0
                ? "Ready to ship"
                : "Out of stock"}
          </span>
        </div>
      </div>
    </motion.article>
  );
}

function ProductSkeleton() {
  return (
    <div className="product-skeleton" aria-hidden="true">
      <div className="skeleton-image" />
      <div className="skeleton-line short" />
      <div className="skeleton-line" />
      <div className="skeleton-line medium" />
    </div>
  );
}

export default function Home() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [catalogNotice, setCatalogNotice] = useState("");
  const [aiProducts, setAiProducts] = useState<Product[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchNotice, setSearchNotice] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        const response = await fetch("/api/products", {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Product API returned ${response.status}.`);
        }

        const data: unknown = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("The product catalog returned an invalid response.");
        }

        let catalog = data;
        if (catalog.length === 0) {
          const seedResponse = await fetch("/api/seed", {
            method: "POST",
            signal: controller.signal,
          });
          if (!seedResponse.ok) {
            throw new Error(`Sample catalog setup returned ${seedResponse.status}.`);
          }
          const refreshedResponse = await fetch("/api/products", {
            signal: controller.signal,
            cache: "no-store",
          });
          if (!refreshedResponse.ok) {
            throw new Error(
              `Product refresh returned ${refreshedResponse.status}.`,
            );
          }
          const refreshedCatalog: unknown = await refreshedResponse.json();
          if (!Array.isArray(refreshedCatalog)) {
            throw new Error("The refreshed product catalog is invalid.");
          }
          catalog = refreshedCatalog;
        }

        const loadedProducts = catalog.map(normalizeProduct);
        setProducts(loadedProducts.length > 0 ? loadedProducts : sampleProducts);
        if (loadedProducts.length === 0) {
          setCatalogNotice("You're seeing our sample collection. Seed the catalog to add your own products.");
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Could not load the live product catalog.", error);
          setProducts(sampleProducts);
          setCatalogNotice("Live catalog unavailable right now — explore our sample collection instead.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadProducts();
    return () => controller.abort();
  }, []);

  const visibleProducts = useMemo(
    () =>
      (aiProducts ?? products).filter((product) => {
        const matchesCategory =
          selectedCategory === "All" || product.category === selectedCategory;
        const matchesText =
          aiProducts !== null || matchesSearch(product, search);
        return matchesCategory && matchesText;
      }),
    [aiProducts, products, search, selectedCategory],
  );

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!search.trim()) {
      setAiProducts(null);
      setSearchNotice("");
      return;
    }

    setIsSearching(true);
    setSearchNotice("");
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: search.trim() }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message ?? "Search is unavailable.");
      }
      if (!Array.isArray(result.products)) {
        throw new Error("Search returned an invalid product list.");
      }
      const matches = result.products.map(normalizeProduct);
      setAiProducts(matches);
      setSearchNotice(
        result.ai
          ? "AI search found these matches."
          : "Smart search matched your words and budget.",
      );
    } catch (error) {
      console.error("Smart search failed.", error);
      setAiProducts(null);
      setSearchNotice(
        error instanceof Error
          ? `${error.message} Showing local matches instead.`
          : "Showing local matches instead.",
      );
    } finally {
      setIsSearching(false);
    }
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setAiProducts(null);
    setSearchNotice("");
  }

  function handleAddToCart(product: Product) {
    addToCart({
      id: product._id,
      name: product.title,
      price: product.price,
      image: product.image,
    });
  }

  return (
    <main>
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">
            <Sparkles size={14} /> A more thoughtful way to shop
          </span>
          <h1>
            Good things
            <br />
            <span>find their way</span>
            <br />
            to you.
          </h1>
          <p className="hero-description">
            A little corner of the internet for lovely finds, independent makers
            and the things that make home feel like yours.
          </p>
          <div className="hero-actions">
            <Link href="#products" className="button-primary">
              Find your next favourite <ArrowRight size={17} />
            </Link>
            <a href="#categories" className="button-link">
              Explore collections <ArrowDown size={15} />
            </a>
          </div>
          <div className="hero-social-proof">
            <div className="avatar-stack" aria-hidden="true">
              <span>R</span>
              <span>A</span>
              <span>M</span>
              <span>K</span>
            </div>
            <p>
              <strong>Loved by 2,400+</strong>
              <br />
              happy neighbourhood shoppers
            </p>
          </div>
        </div>

        <div className="hero-art">
          <ProductImage
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=90"
            alt="A curated selection of everyday clothing and accessories"
            priority
            sizes="(max-width: 768px) 100vw, 52vw"
            className="hero-image"
          />
          <div className="hero-image-shade" />
          <div className="hero-note">
            <span className="hero-note-icon">
              <Leaf size={18} />
            </span>
            <span>
              <strong>Good by nature</strong>
              <small>Thoughtful finds, always</small>
            </span>
            <ArrowUpRight size={16} />
          </div>
          <div className="hero-stamp" aria-label="Thoughtfully picked, locally loved">
            <span>THOUGHTFULLY</span>
            <span>✳</span>
            <span>PICKED</span>
            <span>LOCALLY LOVED</span>
          </div>
        </div>

        <div className="hero-bottom-line">
          <span>01 / 04 — Meet your new favourite place to browse</span>
          <span className="hero-scroll">SCROLL TO DISCOVER ↓</span>
        </div>
      </section>

      <section className="benefit-strip" aria-label="Shopping benefits">
        <div>
          <Truck size={20} />
          <span>Free delivery over ₹1,499</span>
        </div>
        <div>
          <ShieldCheck size={20} />
          <span>Thoughtfully vetted sellers</span>
        </div>
        <div>
          <Check size={19} />
          <span>Easy, no-fuss returns</span>
        </div>
      </section>

      <section id="categories" className="content-section category-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">A good place to begin</span>
            <h2>What are you in the mood for?</h2>
          </div>
          <a href="#products" className="text-link">
            All collections <ArrowRight size={15} />
          </a>
        </div>
        <div className="category-grid">
          {categories.map((category, index) => (
            <a
              href="#products"
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              className={`category-tile category-tile-${index + 1}`}
            >
              <ProductImage
                src={category.image}
                alt=""
                sizes="(max-width: 640px) 50vw, 25vw"
                className="category-image"
              />
              <span className="category-overlay" />
              <span className="category-label">
                <span>
                  <strong>{category.name}</strong>
                  <small>{category.note}</small>
                </span>
                <ArrowUpRight size={18} />
              </span>
            </a>
          ))}
        </div>
      </section>

      <section id="products" className="content-section products-section">
        <div className="section-heading products-heading">
          <div>
            <span className="eyebrow">
              <Sparkles size={14} /> The neighbourhood edit
            </span>
            <h2>Little things, big joy.</h2>
            <p>A few things we think you’ll love, picked just for you.</p>
          </div>
          <a href="#categories" className="text-link">
            View all finds <ArrowRight size={15} />
          </a>
        </div>

        <form
          className="smart-search"
          role="search"
          onSubmit={handleSearch}
        >
          <Search size={19} />
          <input
            aria-label="Search products"
            type="search"
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Try “casual summer wear under ₹2,000”"
          />
          <button
            type="submit"
            className="search-ai-label"
            disabled={isSearching}
          >
            <Sparkles size={13} />
            {isSearching ? "Searching…" : "Smart search"}
          </button>
        </form>
        <div className="filter-row" aria-label="Filter products by category">
          {["All", ...categories.map((category) => category.name)].map(
            (category) => (
              <button
                type="button"
                key={category}
                aria-pressed={selectedCategory === category}
                onClick={() => setSelectedCategory(category)}
                className={`filter-chip ${selectedCategory === category ? "active" : ""}`}
              >
                {category}
              </button>
            ),
          )}
        </div>

        {catalogNotice && (
          <p className="catalog-notice" role="status">
            {catalogNotice}
          </p>
        )}
        {searchNotice && (
          <p className="catalog-notice" role="status">
            {searchNotice}
          </p>
        )}

        {isLoading ? (
          <div className="product-grid" aria-label="Loading products">
            {Array.from({ length: 8 }, (_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        ) : visibleProducts.length > 0 ? (
          <div className="product-grid">
            {visibleProducts.map((product, index) => (
              <ProductCard
                key={product._id}
                product={product}
                index={index}
                onAdd={handleAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className="empty-results">
            <Search size={24} />
            <h3>No finds just yet</h3>
            <p>Try a different search or browse another collection.</p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedCategory("All");
                setAiProducts(null);
                setSearchNotice("");
              }}
            >
              Clear filters
            </button>
          </div>
        )}
        <div className="center-cta">
          <Link href="#categories" className="button-outline">
            Take another look <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="community-banner">
        <div className="community-icon">
          <Leaf size={24} />
        </div>
        <div>
          <span className="eyebrow">A little more meaning in every parcel</span>
          <h2>Small makers. Good things. A lighter footprint.</h2>
          <p>
            Every thoughtful find helps independent makers and local sellers
            grow. That feels good, doesn’t it?
          </p>
        </div>
        <Link href="/about" aria-label="Learn more about Nook" className="round-link">
          <ArrowUpRight size={21} />
        </Link>
      </section>

      <footer className="home-footer">
        <span>nook<span className="brand-dot">.</span> — good things, closer to home.</span>
        <span>Thoughtfully found. Happily kept.</span>
      </footer>
    </main>
  );
}
