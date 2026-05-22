import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import ErrorBoundary from '@/components/ErrorBoundary';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Facilities from '@/pages/Facilities';
import Products from '@/pages/Products';
import Inventory from '@/pages/Inventory';
import Orders from '@/pages/Orders';
import Shipments from '@/pages/Shipments';
import Transfers from '@/pages/Transfers';
import Forecasting from '@/pages/Forecasting';
import Reports from '@/pages/Reports';
import Users from '@/pages/Users';
import FacilityUsers from '@/pages/FacilityUsers';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
              <Route path="/facilities" element={<ErrorBoundary><Facilities /></ErrorBoundary>} />
              <Route path="/products" element={<ErrorBoundary><Products /></ErrorBoundary>} />
              <Route path="/inventory" element={<ErrorBoundary><Inventory /></ErrorBoundary>} />
              <Route path="/orders" element={<ErrorBoundary><Orders /></ErrorBoundary>} />
              <Route path="/shipments" element={<ErrorBoundary><Shipments /></ErrorBoundary>} />
              <Route path="/transfers" element={<ErrorBoundary><Transfers /></ErrorBoundary>} />
              <Route path="/forecasting" element={<ErrorBoundary><Forecasting /></ErrorBoundary>} />
              <Route path="/reports" element={<ErrorBoundary><Reports /></ErrorBoundary>} />
              <Route path="/users" element={<ProtectedRoute requireAdmin><ErrorBoundary><Users /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/facility-users" element={<ProtectedRoute requirePharmacist><ErrorBoundary><FacilityUsers /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/" element={<Navigate to="/inventory" replace />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            classNames: {
              toast: 'font-sans text-sm shadow-lg rounded-xl border',
              success: 'border-green-200 bg-green-50 text-green-900',
              error: 'border-red-200 bg-red-50 text-red-900',
              warning: 'border-amber-200 bg-amber-50 text-amber-900',
              info: 'border-blue-200 bg-blue-50 text-blue-900',
            },
          }}
          richColors
          closeButton
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}
