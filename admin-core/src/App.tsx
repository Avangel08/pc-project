import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
import ProductManagement from "./pages/ProductManagement";
import OrderManagement from "./pages/OrderManagement";
import CustomerManagement from "./pages/CustomerManagement";
import PromotionManagement from "./pages/PromotionManagement";
import ContentManagement from "./pages/ContentManagement";
import ReviewManagement from "./pages/ReviewManagement";
import StaffManagement from "./pages/StaffManagement";
import CustomerSupport from "./pages/CustomerSupport";
import SystemSettings from "./pages/SystemSettings";
import NotFound from "./pages/NotFound";
import SalesDashboard from "./pages/SalesDashboard";
import SalesOrders from "./pages/SalesOrders";
import SalesCustomers from "./pages/SalesCustomers";
import SalesProducts from "./pages/SalesProducts";
import SalesSupport from "./pages/SalesSupport";
import SalesPromotions from "./pages/SalesPromotions";
import SalesNotifications from "./pages/SalesNotifications";
import SalesProfile from "./pages/SalesProfile";
import { ReportsPage } from './pages/ReportsPage';
import InventoryManagement from "./pages/InventoryManagement";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/support" element={<ProtectedRoute><CustomerSupport /></ProtectedRoute>} />
              <Route path="/admin/products" element={<ProtectedRoute><ProductManagement /></ProtectedRoute>} />
              <Route path="/admin/orders" element={<ProtectedRoute><OrderManagement /></ProtectedRoute>} />
              <Route path="/admin/inventory" element={<ProtectedRoute><InventoryManagement /></ProtectedRoute>} />
              <Route path="/admin/customers" element={<ProtectedRoute><CustomerManagement /></ProtectedRoute>} />
              <Route path="/admin/promotions" element={<ProtectedRoute><PromotionManagement /></ProtectedRoute>} />
              <Route path="/admin/content" element={<ProtectedRoute><ContentManagement /></ProtectedRoute>} />
              <Route path="/admin/reviews" element={<ProtectedRoute><ReviewManagement /></ProtectedRoute>} />
              <Route path="/admin/staff" element={<ProtectedRoute><StaffManagement /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute><SystemSettings /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
              <Route path="/sales" element={<ProtectedRoute><SalesDashboard /></ProtectedRoute>} />
              <Route path="/sales/orders" element={<ProtectedRoute><SalesOrders /></ProtectedRoute>} />
              <Route path="/sales/customers" element={<ProtectedRoute><SalesCustomers /></ProtectedRoute>} />
              <Route path="/sales/products" element={<ProtectedRoute><SalesProducts /></ProtectedRoute>} />
              <Route path="/sales/support" element={<ProtectedRoute><SalesSupport /></ProtectedRoute>} />
              <Route path="/sales/promotions" element={<ProtectedRoute><SalesPromotions /></ProtectedRoute>} />
              <Route path="/sales/notifications" element={<ProtectedRoute><SalesNotifications /></ProtectedRoute>} />
              <Route path="/sales/profile" element={<ProtectedRoute><SalesProfile /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
