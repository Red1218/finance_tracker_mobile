import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';

const categorySchema = z.object({
  name: z.string().trim().min(1, 'Category name is required').max(50, 'Category name must be less than 50 characters'),
});

interface AddCategoryFormProps {
  onAdd: (name: string) => void;
}

export const AddCategoryForm = ({ onAdd }: AddCategoryFormProps) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = categorySchema.safeParse({ name });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    onAdd(result.data.name);
    setName('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        placeholder="Category name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1"
        maxLength={50}
      />
      <Button type="submit" disabled={!name.trim()}>
        <Plus className="h-4 w-4" />
        Add
      </Button>
    </form>
  );
};
