import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Facilities from '@/pages/Facilities';
import Products from '@/pages/Products';
import Inventory from '@/pages/Inventory';
import Orders from '@/pages/Orders';
import Shipments from '@/pages/Shipments';
import Reports from '@/pages/Reports';
import Users from '@/pages/Users';
import FacilityUsers from '@/pages/FacilityUsers';

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
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/facilities" element={<Facilities />} />
              <Route path="/products" element={<Products />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/shipments" element={<Shipments />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/users" element={<ProtectedRoute requireAdmin><Users /></ProtectedRoute>} />
              <Route path="/facility-users" element={<ProtectedRoute requirePharmacist><FacilityUsers /></ProtectedRoute>} />
              <Route path="/" element={<Navigate to="/inventory" replace />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
