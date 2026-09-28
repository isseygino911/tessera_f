import { Suspense, lazy } from 'react';
import { Outlet, Route, Routes } from 'react-router-dom';
import { CartProvider } from '@/context/CartContext.jsx';
import Header from '@/components/Header.jsx';
import SiteFooter from '@/components/SiteFooter.jsx';
import LandingPage from '@/pages/store/LandingPage.jsx';
import ProductPage from '@/pages/store/ProductPage.jsx';
import CartPage from '@/pages/store/CartPage.jsx';
import CheckoutPage from '@/pages/store/CheckoutPage.jsx';
import ThanksPage from '@/pages/store/ThanksPage.jsx';

const AdminApp = lazy(() => import('@/pages/admin/AdminApp.jsx'));

function StoreLayout() {
  return (
    <div className="app-shell lux">
      <Header />
      <main className="app-main">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <Routes>
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<p className="container">Loading…</p>}>
              <AdminApp />
            </Suspense>
          }
        />
        <Route element={<StoreLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/products/:slug" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/thanks/:id" element={<ThanksPage />} />
        </Route>
      </Routes>
    </CartProvider>
  );
}
