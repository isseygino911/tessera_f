import { Route, Routes } from 'react-router-dom';
import AdminLayout from './AdminLayout.jsx';
import DashboardPage from './DashboardPage.jsx';
import ProductsListPage from './ProductsListPage.jsx';
import ProductEditPage from './ProductEditPage.jsx';
import OrdersListPage from './OrdersListPage.jsx';
import OrderDetailPage from './OrderDetailPage.jsx';
import EmailTestPage from './EmailTestPage.jsx';

export default function AdminApp() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsListPage />} />
        <Route path="products/:id" element={<ProductEditPage />} />
        <Route path="orders" element={<OrdersListPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />
        <Route path="email-test" element={<EmailTestPage />} />
      </Route>
    </Routes>
  );
}
