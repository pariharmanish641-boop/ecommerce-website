"use client";

import Image from "next/image";
import { useState } from "react";

type ProductImageProps = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
};

export default function ProductImage({
  src,
  alt,
  sizes,
  className,
  priority = false,
}: ProductImageProps) {
  const [imageSrc, setImageSrc] = useState(src || "/product-fallback.svg");

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      priority={priority}
      unoptimized={
        imageSrc.startsWith("/") ||
        !imageSrc.startsWith("https://images.unsplash.com/")
      }
      sizes={sizes}
      className={className}
      onError={() => {
        if (imageSrc !== "/product-fallback.svg") {
          setImageSrc("/product-fallback.svg");
        }
      }}
    />
  );
}
