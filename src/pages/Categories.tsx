import { useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { AddCategoryForm } from '@/components/forms/AddCategoryForm';
import { CategoryList } from '@/components/lists/CategoryList';
import { useBudgetContext } from '@/contexts/BudgetContext';

const DEFAULT_CATEGORIES = ['Credit Card'];

const Categories = () => {
  const { data, addCategory, deleteCategory } = useBudgetContext();

  useEffect(() => {
    const existingNames = data.categories.map(c => c.name.toLowerCase());
    DEFAULT_CATEGORIES.forEach(name => {
      if (!existingNames.includes(name.toLowerCase())) {
        addCategory(name);
      }
    });
  }, []);

  return (
    <Layout>
      <PageHeader 
        title="Categories" 
        subtitle="Manage your spending categories"
      />

      <div className="space-y-6">
        <AddCategoryForm onAdd={addCategory} />
        <CategoryList 
          categories={data.categories} 
          onDelete={deleteCategory} 
        />
      </div>
    </Layout>
  );
};

export default Categories;
