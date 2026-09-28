// Static facts drawn from the site's own copy (see LandingPage.jsx / ProductPage.jsx).
// The product API only returns id, slug, name, hex, tagline, story, priceCents, stock —
// no measurements — so these stay generic across every product. No invented specs.

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
      { term: 'How', detail: 'Order online, direct from the studio' },
      { term: 'Delivery', detail: 'Packed by hand and shipped from our studio' },
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
    title: 'Direct from the studio',
    text: 'Order online and we pack and ship each bracelet ourselves.',
  },
];
