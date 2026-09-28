import { useState } from 'react';
import { api, ApiError } from '@/lib/api.js';

const ROLES = ['main', 'gallery', 'banner', 'other'];
const FITS = ['cover', 'contain'];

function toFormState(image) {
  return {
    role: image.role,
    fit: image.fit,
    alt: image.alt ?? '',
    sortOrder: image.sortOrder ?? 0,
  };
}

export default function ProductImages({ product, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const images = product.images ?? [];

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;

    setError(null);
    setUploading(true);
    try {
      for (const file of files) {
        const updated = await api.adminUploadImage(product.id, file);
        onChange(updated);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="product-images">
      {error && (
        <p className="form-banner" role="alert">
          {error}
        </p>
      )}

      <div className="form-field">
        <label htmlFor="product-images-upload">Add photos</label>
        <input
          id="product-images-upload"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleUpload}
          disabled={uploading}
        />
        {uploading && <p className="form-hint">Uploading…</p>}
      </div>

      <div className="product-images__grid">
        {images.map((image, index) => (
          <ImageCard
            key={image.id}
            image={image}
            index={index}
            productId={product.id}
            onChange={onChange}
            setError={setError}
          />
        ))}
      </div>
    </div>
  );
}

function ImageCard({ image, index, productId, onChange, setError }) {
  const [form, setForm] = useState(() => toFormState(image));
  const [prevImage, setPrevImage] = useState(image);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (image !== prevImage) {
    setPrevImage(image);
    setForm(toFormState(image));
  }

  const n = index + 1;

  const handleField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async () => {
    setError(null);
    setSaving(true);

    const original = toFormState(image);
    const changes = {};
    for (const key of Object.keys(form)) {
      const value = key === 'sortOrder' ? Number(form[key]) : form[key];
      if (value !== original[key]) changes[key] = value;
    }

    if (Object.keys(changes).length === 0) {
      setSaving(false);
      return;
    }

    try {
      const updated = await api.adminUpdateImage(productId, image.id, changes);
      onChange(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save image.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = () => setConfirming((current) => !current);

  const handleDeleteConfirm = async () => {
    setError(null);
    setDeleting(true);
    try {
      const updated = await api.adminDeleteImage(productId, image.id);
      onChange(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete image.');
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  };

  return (
    <div className="product-images__card">
      <div className="product-images__thumb-wrap">
        <img className="product-images__thumb" src={image.url} alt={image.alt ?? ''} />
        {(image.role === 'main' || image.role === 'banner') && (
          <span className="product-images__badge">{image.role}</span>
        )}
      </div>

      <div className="product-images__row">
        <div className="form-field">
          <label htmlFor={`image-role-${image.id}`}>Role</label>
          <select
            id={`image-role-${image.id}`}
            aria-label={`Role for image ${n}`}
            value={form.role}
            onChange={handleField('role')}
          >
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor={`image-fit-${image.id}`}>Fit</label>
          <select
            id={`image-fit-${image.id}`}
            aria-label={`Fit for image ${n}`}
            value={form.fit}
            onChange={handleField('fit')}
          >
            {FITS.map((fit) => (
              <option key={fit} value={fit}>
                {fit}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-field">
        <label htmlFor={`image-alt-${image.id}`}>Alt text</label>
        <input
          id={`image-alt-${image.id}`}
          aria-label={`Alt text for image ${n}`}
          value={form.alt}
          onChange={handleField('alt')}
        />
      </div>

      <div className="form-field">
        <label htmlFor={`image-order-${image.id}`}>Order</label>
        <input
          id={`image-order-${image.id}`}
          aria-label={`Order for image ${n}`}
          type="number"
          value={form.sortOrder}
          onChange={handleField('sortOrder')}
        />
      </div>

      <div className="product-images__actions">
        <button
          type="button"
          className="btn-gold btn-gold--sm"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        {confirming ? (
          <button
            type="button"
            className="btn-outline btn-outline--sm btn-outline--danger"
            onClick={handleDeleteConfirm}
            disabled={deleting}
          >
            {deleting ? 'Deleting…' : 'Confirm delete'}
          </button>
        ) : (
          <button type="button" className="btn-outline btn-outline--sm" onClick={handleDeleteClick}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
