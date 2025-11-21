import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { ReservationFlow } from './pages/ReservationFlow';
import { AdminDashboard } from './pages/AdminDashboard';
import { Menu } from './pages/Menu';
import { Cart } from './pages/Cart';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center">Laden...</div>;
  if (!currentUser) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// Admin Route Wrapper
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading, isAdmin } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center">Laden...</div>;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <CartProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/reservation" element={<ReservationFlow />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
          </Routes>
        </Layout>
      </Router>
    </CartProvider>
  );
}

export default App;