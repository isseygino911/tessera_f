import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, ApiError } from '@/lib/api.js';
import { productImage } from '@/lib/productImage.js';

const EMPTY = {
  slug: '',
  name: '',
  hex: '#e0a030',
  tagline: '',
  story: '',
  priceCents: 4800,
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
    priceCents: product.priceCents ?? 0,
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
  const [imageBroken, setImageBroken] = useState(false);
  const [prevSlug, setPrevSlug] = useState(form.slug);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) return;
    api
      .adminGetProduct(id)
      .then((product) => setForm(toFormState(product)))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load product.'))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  if (form.slug !== prevSlug) {
    setPrevSlug(form.slug);
    setImageBroken(false);
  }

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      ...form,
      priceCents: Number(form.priceCents),
      stock: Number(form.stock),
      sortOrder: Number(form.sortOrder),
    };

    try {
      if (isNew) {
        await api.adminCreateProduct(payload);
      } else {
        await api.adminUpdateProduct(id, payload);
      }

      navigate('/admin/products');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save product.');
    } finally {
      setSaving(false);
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

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label>Photo</label>
          {form.slug && !imageBroken ? (
            <img
              className="image-upload-preview"
              src={productImage(form.slug)}
              alt={form.name ? `${form.name} preview` : 'Product preview'}
              onError={() => setImageBroken(true)}
            />
          ) : (
            <div
              className="image-upload-preview image-upload-preview--placeholder"
              aria-hidden="true"
            />
          )}
          <p className="form-hint">
            Photo is served from client/public/products/{form.slug || '<slug>'}.jpg
          </p>
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="name">Name</label>
            <input id="name" value={form.name} onChange={handleChange('name')} required />
          </div>

          <div className="form-field">
            <label htmlFor="slug">Slug</label>
            <input id="slug" value={form.slug} onChange={handleChange('slug')} required />
          </div>

          <div className="form-field">
            <label htmlFor="hex">Color swatch</label>
            <input id="hex" type="color" value={form.hex} onChange={handleChange('hex')} />
          </div>

          <div className="form-field">
            <label htmlFor="priceCents">Price (cents)</label>
            <input
              id="priceCents"
              type="number"
              min={0}
              value={form.priceCents}
              onChange={handleChange('priceCents')}
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
