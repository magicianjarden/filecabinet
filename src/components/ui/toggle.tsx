import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';
import { Lock, Unlock } from 'lucide-react';

export interface ToggleProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
}

export const Toggle = React.forwardRef<React.ElementRef<typeof SwitchPrimitives.Root>, ToggleProps>(
  ({ checked, onCheckedChange, label, className, ...props }, ref) => (
    <div className="flex items-center gap-2">
      {label && <span className="text-sm text-slate-700 select-none mr-2">{label}</span>}
      <span className="flex items-center gap-1">
        {checked ? (
          <>
            <Lock className="h-4 w-4 text-green-700" aria-label="On" />
            <span className="text-xs text-green-700 font-semibold">On</span>
          </>
        ) : (
          <>
            <Unlock className="h-4 w-4 text-slate-400" aria-label="Off" />
            <span className="text-xs text-slate-400 font-semibold">Off</span>
          </>
        )}
      </span>
      <SwitchPrimitives.Root
        ref={ref}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className={cn(
          'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-green-300 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
          'bg-white data-[state=checked]:bg-green-600',
          className
        )}
        aria-checked={checked}
        {...props}
      >
        <SwitchPrimitives.Thumb
          className={cn(
            'pointer-events-none block h-5 w-5 rounded-full bg-green-600 shadow-lg ring-0 transition-transform duration-200 translate-x-0 peer-checked:translate-x-5',
            'peer-checked:bg-green-600 peer-checked:shadow-green-200',
          )}
        />
      </SwitchPrimitives.Root>
    </div>
  )
);
Toggle.displayName = 'Toggle'; 