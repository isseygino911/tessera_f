// Copy for the homepage. Everything here is ours: it reuses the existing
// TRUST and SPEC_GROUPS facts and each product's own images rather than
// duplicating text, plus a few verbatim sentences pulled from the product
// API's own story copy. Nothing is copied from drinkstill.nz.
import { TRUST, SPEC_GROUPS } from './productFacts.js';

// Hero copy.
export const HERO = {
  eyebrow: '01 / The Collection',
  title: 'Hand-faceted crystal, cut to hold the light.',
  lede: 'Crystal bracelets, hand-faceted bead by bead until each one catches light from every angle.',
  lineLeft: 'Cut to hold the light.',
};

const fit = SPEC_GROUPS.find((group) => group.title === 'Fit');
const closure = fit.items.find((item) => item.term === 'Closure');

// Four tabs: the three TRUST blocks, plus the Fit spec's closure detail,
// matching the order given in the interface contract.
export const CRAFT_TABS = [
  {
    id: 'hand-faceted',
    label: TRUST[0].title,
    title: TRUST[0].title,
    text: TRUST[0].text,
  },
  {
    id: 'matched-by-eye',
    label: TRUST[1].title,
    title: TRUST[1].title,
    text: TRUST[1].text,
  },
  {
    id: 'stretch-fit',
    label: 'Stretch fit',
    title: 'Stretch fit',
    text: closure.detail,
  },
  {
    id: 'personal-ordering',
    label: TRUST[2].title,
    title: TRUST[2].title,
    text: TRUST[2].text,
  },
];

// "Our Studio" copy. Built only on what the site already states: cut by hand,
// matched by eye, packed and shipped by the studio itself.
export const STORY = {
  lead: 'Some things are worth doing slowly.',
  paragraphs: [
    'Every Tessera bracelet starts as a tray of plain crystal beads. We cut each one by hand, plane by plane, until it stops being a bead and starts holding the light.',
    'Then we match them by eye, one at a time, so the strand on your wrist reads as a single colour, the way the light does in the last hour of the afternoon.',
    "It's slow work, and we wouldn't have it any other way. A bracelet you wear every day becomes part of those days: the morning coffee, the long commute, the hand you reach for. It should be made with that kind of care.",
  ],
  signoff: 'Made by hand, packed by hand, sent from our studio to you.',
};

// One verbatim sentence per product story, kept short.
export const QUOTES = [
  {
    slug: 'sunlit-amber',
    name: 'Sunlit Amber',
    text: "Amber isn't really one color.",
  },
  {
    slug: 'forest-emerald',
    name: 'Forest Emerald',
    text: 'Growth in a forest is almost never a performance.',
  },
  {
    slug: 'ocean-topaz',
    name: 'Ocean Topaz',
    text: 'The idea for this one came from wading, not swimming.',
  },
];

export const HOW_IT_WORKS = [
  {
    title: 'Choose',
    text: 'Crystal bead bracelets, faceted by hand one bead at a time. Every colour with a story of its own.',
  },
  {
    title: 'Order',
    text: 'Add your bracelets to the cart and check out in a minute.',
  },
  {
    title: 'We ship',
    text: 'Each bracelet is packed by hand and sent straight from our studio.',
  },
];
