import { Layout } from '@/components/layout/Layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { AddCategoryForm } from '@/components/forms/AddCategoryForm';
import { CategoryList } from '@/components/lists/CategoryList';
import { useBudgetContext } from '@/contexts/BudgetContext';

const Categories = () => {
  const { data, addCategory, deleteCategory } = useBudgetContext();

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
