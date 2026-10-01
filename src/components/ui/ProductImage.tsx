
"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";
import { PackageX } from "lucide-react";

interface ProductImageProps extends Omit<ImageProps, "src"> {
  matCode: string;
  alt: string;
  databaseImageUrl?: string | null;
}

export default function ProductImage({ matCode, alt, databaseImageUrl, className, ...props }: ProductImageProps) {
  // Since public/images/products doesn't exist, we only rely on databaseImageUrl
  const [src, setSrc] = useState(databaseImageUrl || "");
  const [hasError, setHasError] = useState(!databaseImageUrl);
  const [isLoading, setIsLoading] = useState(!!databaseImageUrl);

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-shopay-gray-light text-shopay-black/30 w-full h-full min-h-[200px] ${className || ""}`}>
         <PackageX className="w-12 h-12" />
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className={`absolute inset-0 bg-shopay-gray-light animate-pulse ${className || ""}`} />
      )}
      <Image
        src={src}
        alt={alt}
        onError={() => setHasError(true)}
        onLoad={() => setIsLoading(false)}
        unoptimized
        className={`${className || ""} ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
        {...props}
      />
    </>
  );
}
