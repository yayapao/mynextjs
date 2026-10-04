'use client';

import { useEffect } from 'react';
import {
  motion,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react';
import { cn } from '@/lib/utils';
import type { AnimatedNumberProps } from '@/types';

// Cult UI Animated Number, adapted from Niu. See cult-ui.LICENSE.
export function AnimatedNumber({
  value,
  precision = 0,
  format = (number) => number.toLocaleString('zh-CN'),
  className,
}: AnimatedNumberProps) {
  const reducedMotion = useReducedMotion();
  const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) =>
    format(Number(current.toFixed(precision)))
  );
  const formattedValue = format(Number(value.toFixed(precision)));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return (
    <span className={cn('font-mono tabular-nums', className)}>
      <span className="sr-only">{formattedValue}</span>
      {reducedMotion ? (
        <span aria-hidden>{formattedValue}</span>
      ) : (
        <motion.span aria-hidden>{display}</motion.span>
      )}
    </span>
  );
}
