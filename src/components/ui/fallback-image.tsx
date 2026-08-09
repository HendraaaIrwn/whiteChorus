"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";

type FallbackImageProps = Omit<ImageProps, "src"> & {
  fallbackSrc: string;
  src?: string | null;
};

export function FallbackImage({
  alt,
  fallbackSrc,
  onError,
  onLoad,
  src,
  ...props
}: FallbackImageProps) {
  const requestedSrc = src || fallbackSrc;
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentSrc = failedSrc === requestedSrc ? fallbackSrc : requestedSrc;

  useEffect(() => {
    if (requestedSrc === fallbackSrc) return;

    timeoutRef.current = setTimeout(() => {
      setFailedSrc(requestedSrc);
    }, 3_000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [fallbackSrc, requestedSrc]);

  return (
    <Image
      {...props}
      alt={alt}
      src={currentSrc}
      unoptimized
      onLoad={(event) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        onLoad?.(event);
      }}
      onError={(event) => {
        if (currentSrc !== fallbackSrc) setFailedSrc(requestedSrc);
        onError?.(event);
      }}
    />
  );
}
