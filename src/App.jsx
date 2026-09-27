import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { CartProvider } from './cart/CartContext.jsx';
import Header from './components/Header.jsx';
import LandingPage from './pages/store/LandingPage.jsx';
import ProductPage from './pages/store/ProductPage.jsx';
import CartPage from './pages/store/CartPage.jsx';
import CheckoutPage from './pages/store/CheckoutPage.jsx';
import ThanksPage from './pages/store/ThanksPage.jsx';

const AdminApp = lazy(() => import('./pages/admin/AdminApp.jsx'));

function StoreLayout({ children }) {
  return (
    <div className="app-shell lux">
      <Header />
      <main className="app-main">{children}</main>
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
        <Route
          path="/"
          element={
            <StoreLayout>
              <LandingPage />
            </StoreLayout>
          }
        />
        <Route
          path="/products/:slug"
          element={
            <StoreLayout>
              <ProductPage />
            </StoreLayout>
          }
        />
        <Route
          path="/cart"
          element={
            <StoreLayout>
              <CartPage />
            </StoreLayout>
          }
        />
        <Route
          path="/checkout"
          element={
            <StoreLayout>
              <CheckoutPage />
            </StoreLayout>
          }
        />
        <Route
          path="/thanks/:id"
          element={
            <StoreLayout>
              <ThanksPage />
            </StoreLayout>
          }
        />
      </Routes>
    </CartProvider>
  );
}
