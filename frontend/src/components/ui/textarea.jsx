import React from 'react';
import { cn } from '../../lib/utils';

const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      'flex min-h-[100px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-[#E5E7EB] placeholder:text-muted transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent resize-none disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export { Textarea };
