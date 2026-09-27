// Static facts drawn from the site's own copy (see LandingPage.jsx / ProductPage.jsx).
// The product API only returns id, slug, name, hex, tagline, story, priceCents, stock —
// no measurements — so these stay generic across every product. No invented specs.

// Card chips: shown top-left on each ProductCard tile.
export const CARD_CHIPS = ['Hand-faceted', 'Stretch fit'];

// Product-page spec groups, rendered as <dl> sections under "Stone", "Fit" and "Ordering".
export const SPEC_GROUPS = [
  {
    title: 'Stone',
    items: [
      { term: 'Cut', detail: 'Hand-faceted, one bead at a time' },
      { term: 'Colour match', detail: 'Beads matched by eye for an even strand' },
    ],
  },
  {
    title: 'Fit',
    items: [
      { term: 'Closure', detail: 'Stretch cord — no clasp' },
      { term: 'Wear', detail: 'Slips over the hand, sits close without pinching' },
    ],
  },
  {
    title: 'Ordering',
    items: [
      { term: 'Requests', detail: 'Order requests only' },
      { term: 'Payment & delivery', detail: 'Arranged with you personally after you order' },
    ],
  },
];

// Product-page trust strip: three short blocks directly under the hero.
export const TRUST = [
  {
    title: 'Hand-faceted',
    text: 'Every bead is cut by hand into dozens of small planes, so it throws light back at you.',
  },
  {
    title: 'Matched by eye',
    text: 'Beads are sorted and matched one at a time, so each strand keeps a single, even colour.',
  },
  {
    title: 'Personal ordering',
    text: "Send an order request and we'll contact you ourselves to arrange payment and delivery.",
  },
];
