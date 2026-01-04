import { ReactNode } from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface QuickStatCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  progress?: number;
  progressColor?: 'default' | 'success' | 'warning' | 'destructive';
  subtitle?: string;
  onClick?: () => void;
}

export const QuickStatCard = ({ 
  title, 
  value, 
  icon, 
  progress,
  progressColor = 'default',
  subtitle,
  onClick 
}: QuickStatCardProps) => {
  const progressColorClasses = {
    default: '',
    success: '[&>div]:bg-success',
    warning: '[&>div]:bg-warning',
    destructive: '[&>div]:bg-destructive',
  };

  return (
    <div 
      className={cn(
        "rounded-xl border border-border bg-card p-4 animate-fade-in",
        onClick && "cursor-pointer hover:bg-accent/50 transition-colors"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider">{title}</span>
      </div>
      
      <p className="mt-2 text-xl font-bold text-foreground">
        ₹{value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </p>

      {progress !== undefined && (
        <div className="mt-3">
          <Progress 
            value={Math.min(progress, 100)} 
            className={cn("h-1.5 bg-muted", progressColorClasses[progressColor])}
          />
          {subtitle && (
            <p className="mt-1 text-right text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      )}

      {subtitle && progress === undefined && (
        <div className="mt-2">
          <span className="inline-block rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {subtitle}
          </span>
        </div>
      )}
    </div>
  );
};
