"use client";

import { useEffect, useRef, useState } from "react";

export function AnimatedCounter({ value }: { value: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let start = 0;
          const end = value;
          if (start === end) return;

          const duration = 2000;
          const startTime = Date.now();

          const animate = () => {
            const currentTime = Date.now();
            const progress = Math.min(1, (currentTime - startTime) / duration);
            const currentCount = Math.floor(progress * (end - start) + start);
            setCount(currentCount);

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [value]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}
