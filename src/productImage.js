// Product photos ship as static files under client/public/products/<slug>.jpg
// (see docs/plans) rather than coming from the API.
export function productImage(slug) {
  return `/products/${slug}.jpg`;
}
