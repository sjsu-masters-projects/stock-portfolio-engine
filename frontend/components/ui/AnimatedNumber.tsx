"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  value: number;
  formatter?: (val: number) => string;
  duration?: number;
  className?: string;
}

// Ease out cubic
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export function AnimatedNumber({ value, formatter = (v) => v.toString(), duration = 800, className }: Props) {
  const [displayValue, setDisplayValue] = useState(value);
  const startValueRef = useRef(value);
  const endValueRef = useRef(value);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (value === endValueRef.current) return;
    
    startValueRef.current = displayValue;
    endValueRef.current = value;
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = timestamp - startTimeRef.current;
      
      if (progress < duration) {
        const p = easeOutCubic(progress / duration);
        const current = startValueRef.current + (endValueRef.current - startValueRef.current) * p;
        setDisplayValue(current);
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValueRef.current);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [value, duration, displayValue]);

  return <span className={className}>{formatter(displayValue)}</span>;
}
