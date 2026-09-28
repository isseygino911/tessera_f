import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '@/lib/api.js';
import { formatPrice } from '@/lib/formatPrice.js';
import { mainImage } from '@/lib/productImages.js';
import { stockLabel } from '@/lib/stockLabel.js';

export default function ProductsListPage() {
  const [products, setProducts] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .adminGetProducts()
      .then(setProducts)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load products.'));
  }, []);

  return (
    <div>
      <div className="admin-head">
        <p className="eyebrow">Catalogue</p>
        <h1>Products</h1>
        <Link to="/admin/products/new" className="btn-gold">
          Add product
        </Link>
      </div>

      {error && (
        <p className="form-banner" role="alert">
          {error}
        </p>
      )}

      {!products && !error && <p>Loading…</p>}

      {products && (
        <table className="data-table">
          <thead>
            <tr>
              <th></th>
              <th></th>
              <th>Name</th>
              <th className="num">Price</th>
              <th className="num">Stock</th>
              <th className="num">Sort</th>
              <th>Active</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const image = mainImage(product);
              return (
                <tr key={product.id}>
                  <td>
                    <span className="table-swatch" style={{ background: product.hex }} />
                  </td>
                  <td>{image ? <img className="table-thumb" src={image.url} alt="" /> : null}</td>
                  <td>{product.name}</td>
                  <td className="num">{formatPrice(product.priceCents)}</td>
                  <td className="num">{stockLabel(product.stock)}</td>
                  <td className="num">{product.sortOrder}</td>
                  <td>{product.active ? 'Yes' : 'No'}</td>
                  <td>
                    <Link to={`/admin/products/${product.id}`} className="admin-link">
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
