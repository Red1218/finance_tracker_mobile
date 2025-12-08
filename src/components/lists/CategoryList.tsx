import { Category } from '@/types/budget';
import { Tag } from 'lucide-react';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';

interface CategoryListProps {
  categories: Category[];
  onDelete: (id: string) => void;
}

export const CategoryList = ({ categories, onDelete }: CategoryListProps) => {
  if (categories.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <Tag className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-3 text-muted-foreground">No categories yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {categories.map((category) => (
        <div
          key={category.id}
          className="flex items-center justify-between rounded-xl border border-border bg-card p-4 animate-fade-in"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Tag className="h-4 w-4 text-primary" />
            </div>
            <span className="font-medium">{category.name}</span>
          </div>
          <DeleteConfirmDialog
            onConfirm={() => onDelete(category.id)}
            title="Delete Category"
            description={`Are you sure you want to delete "${category.name}"? This action cannot be undone.`}
          />
        </div>
      ))}
    </div>
  );
};
