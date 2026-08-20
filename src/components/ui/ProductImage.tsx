"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";

interface ProductImageProps extends Omit<ImageProps, "src"> {
  matCode: string;
  alt: string;
  databaseImageUrl?: string | null;
}

export default function ProductImage({ matCode, alt, databaseImageUrl, ...props }: ProductImageProps) {
  // 1. First priority: Image from database if uploaded via admin later.
  // 2. Second priority: Local file named by MatCode.
  // 3. Fallback: Placeholder.
  
  const initialSrc = databaseImageUrl || `/images/products/${matCode}.jpg`;
  const fallbackSrc = `https://placehold.co/600x600/f5f5f7/5B2A6E?text=${encodeURIComponent('صورة ' + matCode)}`;

  const [src, setSrc] = useState(initialSrc);
  const [errorCount, setErrorCount] = useState(0);

  const handleError = () => {
    // If we haven't tried the fallback yet, switch to it
    if (errorCount === 0) {
      setErrorCount(1);
      setSrc(fallbackSrc);
    }
  };

  return (
    <Image
      src={src}
      alt={alt}
      onError={handleError}
      unoptimized // Allows external domains and local static files to just work
      {...props}
    />
  );
}
