import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, ApiError } from '@/lib/api.js';
import ProductImages from './ProductImages.jsx';

function slugify(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const EMPTY = {
  slug: '',
  name: '',
  hex: '#e0a030',
  tagline: '',
  story: '',
  priceDollars: '48.00',
  stock: 0,
  sortOrder: 0,
  active: true,
};

function toFormState(product) {
  return {
    slug: product.slug ?? '',
    name: product.name ?? '',
    hex: product.hex ?? '#e0a030',
    tagline: product.tagline ?? '',
    story: product.story ?? '',
    priceDollars: ((product.priceCents ?? 0) / 100).toFixed(2),
    stock: product.stock ?? 0,
    sortOrder: product.sortOrder ?? 0,
    active: product.active ?? true,
  };
}

export default function ProductEditPage() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [product, setProduct] = useState(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [softDeletedMessage, setSoftDeletedMessage] = useState(null);
  const [prevId, setPrevId] = useState(id);

  // The route re-renders this page in place after a create (id: "new" -> the
  // new id), rather than unmounting it, so `loading` and `product` have to be
  // reset as soon as `id` changes, before the fetch effect below even runs.
  if (id !== prevId) {
    setPrevId(id);
    setProduct(null);
    setLoading(!isNew);
  }

  useEffect(() => {
    if (isNew) return;
    api
      .adminGetProduct(id)
      .then((loaded) => {
        setForm(toFormState(loaded));
        setProduct(loaded);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load product.'))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setForm((prev) => ({
      ...prev,
      name,
      slug: isNew && !slugTouched ? slugify(name) : prev.slug,
    }));
  };

  const handleSlugChange = (e) => {
    setSlugTouched(true);
    setForm((prev) => ({ ...prev, slug: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      slug: form.slug,
      name: form.name,
      hex: form.hex,
      tagline: form.tagline,
      story: form.story,
      priceCents: Math.round(Number(form.priceDollars) * 100),
      stock: Number(form.stock),
      sortOrder: Number(form.sortOrder),
      active: form.active,
    };

    try {
      if (isNew) {
        const created = await api.adminCreateProduct(payload);
        navigate(`/admin/products/${created.id}`);
      } else {
        await api.adminUpdateProduct(id, payload);
        navigate('/admin/products');
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = () => setConfirmingDelete(true);

  const handleDeleteConfirm = async () => {
    setError(null);
    setDeleting(true);
    try {
      const result = await api.adminDeleteProduct(id);
      if (result.softDeleted) {
        setSoftDeletedMessage('This product has orders, so it was deactivated instead.');
        setForm((prev) => ({ ...prev, active: false }));
      } else {
        navigate('/admin/products');
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete product.');
    } finally {
      setDeleting(false);
      setConfirmingDelete(false);
    }
  };

  if (loading) {
    return <p>Loading…</p>;
  }

  return (
    <div>
      <h1>{isNew ? 'Add product' : 'Edit product'}</h1>

      {error && (
        <p className="form-banner" role="alert">
          {error}
        </p>
      )}

      {softDeletedMessage && (
        <p className="form-banner" role="alert">
          {softDeletedMessage}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label>Photos</label>
          {isNew ? (
            <p className="form-hint">Save the product to add photos.</p>
          ) : (
            <ProductImages product={product} onChange={setProduct} />
          )}
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="name">Name</label>
            <input id="name" value={form.name} onChange={handleNameChange} required />
          </div>

          <div className="form-field">
            <label htmlFor="slug">Slug</label>
            <input id="slug" value={form.slug} onChange={handleSlugChange} required />
          </div>

          <div className="form-field">
            <label htmlFor="hex">Color swatch</label>
            <input id="hex" type="color" value={form.hex} onChange={handleChange('hex')} />
          </div>

          <div className="form-field">
            <label htmlFor="priceDollars">Price ($)</label>
            <input
              id="priceDollars"
              type="number"
              min={0}
              step={0.01}
              value={form.priceDollars}
              onChange={handleChange('priceDollars')}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="stock">Stock</label>
            <input
              id="stock"
              type="number"
              min={0}
              value={form.stock}
              onChange={handleChange('stock')}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="sortOrder">Sort order</label>
            <input
              id="sortOrder"
              type="number"
              value={form.sortOrder}
              onChange={handleChange('sortOrder')}
            />
          </div>

          <div className="form-field">
            <label htmlFor="active">
              <input
                id="active"
                type="checkbox"
                checked={form.active}
                onChange={handleChange('active')}
              />{' '}
              Active
            </label>
          </div>

          <div className="form-field form-field--full">
            <label htmlFor="tagline">Tagline</label>
            <input id="tagline" value={form.tagline} onChange={handleChange('tagline')} />
          </div>

          <div className="form-field form-field--full">
            <label htmlFor="story">Story</label>
            <textarea id="story" rows={16} value={form.story} onChange={handleChange('story')} />
          </div>
        </div>

        <div className="product__actions" style={{ justifyContent: 'flex-end' }}>
          {!isNew &&
            (confirmingDelete ? (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Confirm delete'}
              </button>
            ) : (
              <button type="button" className="btn btn-secondary" onClick={handleDeleteClick}>
                Delete product
              </button>
            ))}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/admin/products')}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
