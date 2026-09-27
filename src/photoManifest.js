// Static manifest of the 18 lifestyle/product photo shoot, keyed by slug.
// Paths resolve to client/public/photos/<slug>/<scene>.jpg — see docs/plans/photo-refresh.md.
export const PHOTO_MANIFEST = {
  'forest-emerald': {
    product: {
      slate:     { file: 'slate.jpg',     alt: 'Forest Emerald bracelet on a dark slate dish' },
      wrist:     { file: 'wrist.jpg',     alt: 'Forest Emerald bracelet worn on a wrist resting on denim' },
      woodslice: { file: 'woodslice.jpg', alt: 'Forest Emerald bracelet laid on a wood slice with eucalyptus' },
    },
    lifestyle: {
      laptop:  { file: 'laptop.jpg',  alt: 'Forest Emerald bracelet worn while typing on a laptop at a wooden desk' },
      commute: { file: 'commute.jpg', alt: 'Forest Emerald bracelet worn on a wrist carrying a canvas bag at a train platform' },
      sketch:  { file: 'sketch.jpg',  alt: 'Forest Emerald bracelet worn while sketching in a notebook' },
    },
  },
  'ocean-topaz': {
    product: {
      reflection: { file: 'reflection.jpg', alt: 'Ocean Topaz bracelet reflected on a dark glossy surface' },
      coffee:     { file: 'coffee.jpg',      alt: 'Ocean Topaz bracelet worn on a wrist beside a coffee cup' },
      giftbox:    { file: 'giftbox.jpg',     alt: 'Ocean Topaz bracelet displayed on a linen cushion in a gift box' },
    },
    lifestyle: {
      cafe:   { file: 'cafe.jpg',   alt: 'Ocean Topaz bracelet worn while gesturing in conversation at a café table' },
      bench:  { file: 'bench.jpg',  alt: 'Ocean Topaz bracelet worn while reading a book on a park bench' },
      dinner: { file: 'dinner.jpg', alt: 'Ocean Topaz bracelet worn at a dinner table, holding a glass of water' },
    },
  },
  'sunlit-amber': {
    product: {
      dish:    { file: 'dish.jpg',    alt: 'Sunlit Amber bracelet on a ceramic dish with dried petals' },
      reading: { file: 'reading.jpg', alt: 'Sunlit Amber bracelet worn while reading at an outdoor wooden table' },
      stone:   { file: 'stone.jpg',   alt: 'Sunlit Amber bracelet resting on sunlit stone' },
    },
    lifestyle: {
      camera:  { file: 'camera.jpg',  alt: 'Sunlit Amber bracelet worn while holding a camera on a boardwalk' },
      phone:   { file: 'phone.jpg',   alt: 'Sunlit Amber bracelet worn while using a phone at an outdoor café' },
      railing: { file: 'railing.jpg', alt: 'Sunlit Amber bracelet worn on a hand resting on a wooden railing' },
    },
  },
};

// e.g. photoUrl('forest-emerald', 'lifestyle', 'commute') -> '/photos/forest-emerald/commute.jpg'
export function photoUrl(slug, group, scene) {
  return `/photos/${slug}/${PHOTO_MANIFEST[slug]?.[group]?.[scene]?.file ?? `${scene}.jpg`}`;
}

export function photoAlt(slug, group, scene) {
  return PHOTO_MANIFEST[slug]?.[group]?.[scene]?.alt ?? '';
}
