import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-accent text-black hover:bg-accentHover h-9 px-4',
        secondary: 'bg-card border border-border text-[#E5E7EB] hover:border-accent/50 h-9 px-4',
        outline: 'border border-border bg-transparent text-[#9CA3AF] hover:text-[#E5E7EB] hover:border-[#374151] h-9 px-4',
        ghost: 'text-[#9CA3AF] hover:text-[#E5E7EB] hover:bg-white/5 h-9 px-4',
        danger: 'text-danger hover:text-red-400 hover:bg-red-500/10 h-9 px-4',
        icon: 'h-8 w-8 rounded-md',
      },
      size: {
        default: '',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-11 px-6',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = 'Button';

export { Button, buttonVariants };
