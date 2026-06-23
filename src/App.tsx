import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { hasToken } from "./api";
import Layout from "./components/Layout";
import CategoriesPage from "./pages/CategoriesPage";
import CouriersPage from "./pages/CouriersPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import OrdersPage from "./pages/OrdersPage";
import ProductsPage from "./pages/ProductsPage";
import UsersPage from "./pages/UsersPage";
import ZonesPage from "./pages/ZonesPage";
import { useAuth } from "./store";

function Protected({ children }: { children: React.ReactNode }) {
  const { admin, loadMe } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!hasToken()) {
      setChecked(true);
      return;
    }
    loadMe().finally(() => setChecked(true));
  }, [loadMe]);

  if (!checked) return <div className="p-10 text-gray-400">…</div>;
  if (!hasToken() || (checked && !admin && !hasToken())) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Protected><DashboardPage /></Protected>} />
      <Route path="/categories" element={<Protected><CategoriesPage /></Protected>} />
      <Route path="/products" element={<Protected><ProductsPage /></Protected>} />
      <Route path="/orders" element={<Protected><OrdersPage /></Protected>} />
      <Route path="/couriers" element={<Protected><CouriersPage /></Protected>} />
      <Route path="/zones" element={<Protected><ZonesPage /></Protected>} />
      <Route path="/users" element={<Protected><UsersPage /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
