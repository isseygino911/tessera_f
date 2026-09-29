import './styles/AddressCard.css';

// One saved address. Actions (account page) come in as children.
export default function AddressCard({ address, children }) {
  const { label, isDefault, recipientName, addressLine1, addressLine2 } = address;

  return (
    <div className="address-card">
      {(label || isDefault) && (
        <p className="address-card__head">
          {label && <span className="address-card__label">{label}</span>}
          {isDefault && <span className="address-card__badge">Default</span>}
        </p>
      )}
      <p className="address-card__lines">
        <span className="address-card__name">{recipientName}</span>
        <span>{addressLine1}</span>
        {addressLine2 && <span>{addressLine2}</span>}
        <span>
          {address.city}, {address.region} {address.postalCode}
        </span>
        <span>{address.country}</span>
        <span>{address.phone}</span>
      </p>
      {children && <div className="address-card__actions">{children}</div>}
    </div>
  );
}
