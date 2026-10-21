"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Product = {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        const response = await fetch("/api/products", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Products could not be loaded. Please try again.");
        }

        const data: Product[] = await response.json();
        setProducts(data);
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Something went wrong while loading products.",
          );
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

  const categories = useMemo(
    () => ["All", ...new Set(products.map((product) => product.category))],
    [products],
  );

  const visibleProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    const query = search.trim().toLowerCase();
    const matchesSearch =
      query.length === 0 ||
      `${product.title} ${product.description} ${product.category}`
        .toLowerCase()
        .includes(query);

    return matchesCategory && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight text-stone-950"
            aria-label="Mercantile home"
          >
            mercantile<span className="text-orange-600">.</span>
          </Link>
          <p className="hidden text-sm font-medium text-stone-500 sm:block">
            Thoughtful finds for everyday living
          </p>
          <Link
            href="#products"
            className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
          >
            Shop collection
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 pb-12 pt-14 sm:px-8 sm:pb-16 sm:pt-20">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-orange-700">
            The everyday edit
          </p>
          <h1 className="text-4xl font-black leading-tight tracking-tight text-stone-950 sm:text-6xl">
            Good things, made
            <span className="text-orange-700"> for living.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-stone-600 sm:text-lg">
            Explore useful, well-made finds for your wardrobe, home, and
            everyday adventures.
          </p>
        </div>
      </section>

      <section
        id="products"
        className="mx-auto max-w-7xl scroll-mt-8 px-5 pb-20 sm:px-8"
      >
        <div className="mb-7 flex flex-col gap-5 border-b border-stone-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-orange-700">
              {isLoading
                ? "Loading collection"
                : `${visibleProducts.length} ${
                    visibleProducts.length === 1 ? "item" : "items"
                  }`}
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Shop all products
            </h2>
          </div>

          <label className="block w-full sm:max-w-xs">
            <span className="sr-only">Search products</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              className="w-full rounded-full border border-stone-300 bg-white px-5 py-3 text-sm outline-none transition placeholder:text-stone-400 focus:border-orange-600 focus:ring-2 focus:ring-orange-100"
            />
          </label>
        </div>

        {!isLoading && !error && categories.length > 1 && (
          <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  selectedCategory === category
                    ? "bg-stone-900 text-white"
                    : "bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-100"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            aria-label="Loading products"
          >
            {Array.from({ length: 8 }, (_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-stone-200 bg-white"
              >
                <div className="aspect-[4/3] animate-pulse bg-stone-200" />
                <div className="space-y-3 p-5">
                  <div className="h-3 w-1/3 animate-pulse rounded bg-stone-200" />
                  <div className="h-5 w-2/3 animate-pulse rounded bg-stone-200" />
                  <div className="h-4 w-full animate-pulse rounded bg-stone-100" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center text-red-800"
          >
            {error}
          </div>
        ) : visibleProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleProducts.map((product) => (
              <article
                key={product._id}
                className="group overflow-hidden rounded-2xl border border-stone-200 bg-white transition duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-stone-900/5"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    loading="lazy"
                    unoptimized
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-stone-700 shadow-sm">
                    {product.category}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold leading-6 text-stone-900">
                      {product.title}
                    </h3>
                    <p className="shrink-0 font-bold text-orange-700">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>
                  <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-stone-500">
                    {product.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
            <h3 className="font-bold text-stone-900">No products found</h3>
            <p className="mt-2 text-sm text-stone-500">
              Try another search or choose a different category.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
