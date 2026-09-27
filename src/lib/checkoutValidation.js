const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// note is optional; everything else is required.
export function validateCheckout(form = {}) {
  const errors = {};

  if (!form.name?.trim()) {
    errors.name = 'Name is required.';
  }

  if (!form.email?.trim()) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_RE.test(form.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (!form.phone?.trim()) {
    errors.phone = 'Phone is required.';
  }

  if (!form.addressLine1?.trim()) {
    errors.addressLine1 = 'Address is required.';
  }

  if (!form.city?.trim()) {
    errors.city = 'City is required.';
  }

  if (!form.region?.trim()) {
    errors.region = 'State / region is required.';
  }

  if (!form.postalCode?.trim()) {
    errors.postalCode = 'Postal code is required.';
  }

  if (!form.country?.trim()) {
    errors.country = 'Country is required.';
  }

  return errors;
}
