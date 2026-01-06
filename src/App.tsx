import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { BudgetProvider } from "@/contexts/BudgetContext";
import Index from "./pages/Index";
import Categories from "./pages/Categories";
import Spends from "./pages/Spends";
import Savings from "./pages/Savings";
import FinancesPage from "./pages/FinancesPage";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/auth" element={<Auth />} />
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <Index />
        </ProtectedRoute>
      }
    />
    <Route
      path="/categories"
      element={
        <ProtectedRoute>
          <Categories />
        </ProtectedRoute>
      }
    />
    <Route
      path="/spends"
      element={
        <ProtectedRoute>
          <Spends />
        </ProtectedRoute>
      }
    />
    <Route
      path="/finances"
      element={
        <ProtectedRoute>
          <FinancesPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/savings"
      element={
        <ProtectedRoute>
          <Savings />
        </ProtectedRoute>
      }
    />
    {/* Redirect old routes to new finances page */}
    <Route path="/cards" element={<Navigate to="/finances" replace />} />
    <Route path="/borrowed" element={<Navigate to="/finances" replace />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <BudgetProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </BudgetProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
