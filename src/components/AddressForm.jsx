import { useState } from 'react';
import { ADDRESS_FIELDS } from '@/data/addressFields.js';
import './styles/AddressForm.css';

const TEXT_FIELDS = [
  { name: 'label', label: 'Label', required: false },
  { name: 'recipientName', label: 'Recipient name', full: true },
  ...ADDRESS_FIELDS,
];

// Add or edit one saved address. `address` prefills it for an edit;
// `onSubmit` gets the trimmed values, ready for the API.
export default function AddressForm({ address, saving, error, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => ({
    ...Object.fromEntries(TEXT_FIELDS.map(({ name }) => [name, address?.[name] ?? ''])),
    isDefault: address?.isDefault ?? false,
  }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const values = Object.fromEntries(
      TEXT_FIELDS.map(({ name }) => [name, form[name].trim() || undefined])
    );
    onSubmit({ ...values, isDefault: form.isDefault });
  };

  return (
    <form
      className="address-form"
      aria-label={address ? 'Edit address' : 'New address'}
      onSubmit={handleSubmit}
    >
      {error && (
        <p className="form-banner" role="alert">
          {error}
        </p>
      )}
      <div className="form-grid">
        {TEXT_FIELDS.map(({ name, label, full, required = true }) => (
          <div key={name} className={`form-field${full ? ' form-field--full' : ''}`}>
            <label htmlFor={`address-${name}`}>
              {label}
              {!required && ' (optional)'}
            </label>
            <input
              id={`address-${name}`}
              name={name}
              type="text"
              required={required}
              value={form[name]}
              onChange={(e) => setForm((prev) => ({ ...prev, [name]: e.target.value }))}
            />
          </div>
        ))}
      </div>
      {!address?.isDefault && (
        <label className="form-check">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(e) => setForm((prev) => ({ ...prev, isDefault: e.target.checked }))}
          />
          Make this my default
        </label>
      )}
      <div className="address-form__foot">
        <button type="submit" className="btn-gold btn-gold--sm" disabled={saving}>
          {saving ? 'Saving…' : 'Save address'}
        </button>
        <button type="button" className="btn-outline btn-outline--sm" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
