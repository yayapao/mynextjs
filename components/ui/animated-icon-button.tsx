'use client';

import { useRef } from 'react';
import type { IconHandle } from '@animateicons/react';
import { useReducedMotion } from 'motion/react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { AnimatedIconButtonProps } from '@/types';

export function AnimatedIconButton({
  icon: Icon,
  label,
  iconSize = 16,
  size = 'icon',
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  ...props
}: AnimatedIconButtonProps) {
  const icon = useRef<IconHandle>(null);
  const reducedMotion = useReducedMotion();
  const start = () => {
    if (!reducedMotion) icon.current?.startAnimation();
  };
  const stop = () => icon.current?.stopAnimation();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          size={size}
          aria-label={label}
          {...props}
          onMouseEnter={(event) => {
            start();
            onMouseEnter?.(event);
          }}
          onMouseLeave={(event) => {
            stop();
            onMouseLeave?.(event);
          }}
          onFocus={(event) => {
            start();
            onFocus?.(event);
          }}
          onBlur={(event) => {
            stop();
            onBlur?.(event);
          }}
        >
          <Icon ref={icon} size={iconSize} isAnimated={false} aria-hidden />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
