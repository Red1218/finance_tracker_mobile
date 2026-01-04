import { TrendingDown, TrendingUp } from 'lucide-react';

interface TotalSpentCardProps {
  totalSpend: number;
  percentageChange?: number;
}

export const TotalSpentCard = ({ totalSpend, percentageChange = 0 }: TotalSpentCardProps) => {
  const isIncrease = percentageChange > 0;
  
  return (
    <div className="gradient-primary rounded-2xl p-5 shadow-glow animate-fade-in">
      <div className="flex items-center gap-2 text-primary-foreground/80">
        <TrendingDown className="h-4 w-4" />
        <span className="text-sm font-medium">Total Spent</span>
      </div>
      
      <p className="mt-2 text-3xl font-bold text-primary-foreground">
        ₹{totalSpend.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </p>
      
      {percentageChange !== 0 && (
        <div className="mt-3 flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
            isIncrease 
              ? 'bg-primary-foreground/20 text-primary-foreground' 
              : 'bg-success/20 text-success'
          }`}>
            {isIncrease ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {isIncrease ? '+' : ''}{percentageChange}%
          </span>
          <span className="text-xs text-primary-foreground/70">vs last month</span>
        </div>
      )}
    </div>
  );
};
