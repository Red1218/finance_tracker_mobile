import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  variant?: 'default' | 'primary' | 'warning';
  className?: string;
}

export const StatCard = ({ title, value, icon, variant = 'default', className }: StatCardProps) => {
  return (
    <div
      className={cn(
        'rounded-xl border border-border p-4 transition-all duration-200 animate-fade-in',
        variant === 'primary' && 'border-primary/30 bg-primary/5',
        variant === 'warning' && 'border-warning/30 bg-warning/5',
        variant === 'default' && 'bg-card',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
        {icon && (
          <div className={cn(
            'text-muted-foreground',
            variant === 'primary' && 'text-primary',
            variant === 'warning' && 'text-warning'
          )}>
            {icon}
          </div>
        )}
      </div>
      <p className={cn(
        'mt-2 text-2xl font-bold tracking-tight',
        variant === 'primary' && 'text-primary',
        variant === 'warning' && 'text-warning'
      )}>
        {typeof value === 'number' ? `₹${value.toLocaleString('en-IN')}` : value}
      </p>
    </div>
  );
};
