// Shipping address fields, shared by checkout and the account page. Their
// names match the order and saved-address fields on the server.
export const ADDRESS_FIELDS = [
  { name: 'phone', label: 'Phone' },
  { name: 'addressLine1', label: 'Address line 1', full: true },
  { name: 'addressLine2', label: 'Address line 2', full: true, required: false },
  { name: 'city', label: 'City' },
  { name: 'region', label: 'State / region' },
  { name: 'postalCode', label: 'Postal code' },
  { name: 'country', label: 'Country' },
];
