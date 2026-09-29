// Images now come from the API on each product as `images: [{ id, name, url,
// alt, role, fit, focalPoint }]`, ordered main → gallery (sort 1..3) → banner
// → other. These helpers pick the right one(s) and tolerate a missing
// product or images array so callers can render a placeholder instead.
const mainImage = (product) => product?.images?.find((img) => img.role === 'main');

const galleryImages = (product) => product?.images?.filter((img) => img.role === 'gallery') ?? [];

const bannerImage = (product) => product?.images?.find((img) => img.role === 'banner');

export { mainImage, galleryImages, bannerImage };
