import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '@/lib/api.js';
import { formatPrice } from '@/lib/formatPrice.js';
import { mainImage } from '@/lib/productImages.js';

function stockLabel(stock) {
  if (stock === 0) return 'Sold out';
  if (stock <= 5) return 'Low';
  return stock;
}

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
      <div className="toolbar">
        <h1>Products</h1>
        <Link to="/admin/products/new" className="btn btn-primary">
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
              <th>Price</th>
              <th>Stock</th>
              <th>Sort</th>
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
                  <td>{formatPrice(product.priceCents)}</td>
                  <td>{stockLabel(product.stock)}</td>
                  <td>{product.sortOrder}</td>
                  <td>{product.active ? 'Yes' : 'No'}</td>
                  <td>
                    <Link to={`/admin/products/${product.id}`} className="btn-link">
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
