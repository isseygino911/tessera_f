// Copy for the /lab landing page. Everything here is ours: it reuses the
// existing TRUST and SPEC_GROUPS facts and the PHOTO_MANIFEST shoot rather
// than duplicating text, plus a few verbatim sentences pulled from the
// product API's own story copy. Nothing is copied from drinkstill.nz.
import { TRUST, SPEC_GROUPS } from './productFacts.js';

// Hero: lines lifted from LandingPage.jsx.
export const HERO = {
  eyebrow: '01 / The Collection',
  title: 'Hand-faceted crystal, cut to hold the light.',
  lede: 'Three bracelets, hand-faceted bead by bead until each one catches light from every angle.',
  lineLeft: 'Cut to hold the light.',
  lineRight: 'Three stones · Hand-faceted',
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
    photo: { slug: 'sunlit-amber', group: 'product', scene: 'dish' },
  },
  {
    id: 'matched-by-eye',
    label: TRUST[1].title,
    title: TRUST[1].title,
    text: TRUST[1].text,
    photo: { slug: 'forest-emerald', group: 'product', scene: 'slate' },
  },
  {
    id: 'stretch-fit',
    label: 'Stretch fit',
    title: 'Stretch fit',
    text: closure.detail,
    photo: { slug: 'ocean-topaz', group: 'product', scene: 'reflection' },
  },
  {
    id: 'personal-ordering',
    label: TRUST[2].title,
    title: TRUST[2].title,
    text: TRUST[2].text,
    photo: { slug: 'sunlit-amber', group: 'product', scene: 'reading' },
  },
];

// Verbatim sentence from Sunlit Amber's story (via api.getProducts()).
export const STORY_LINE =
  "That last hour before dusk does something to a room: it slows everything down, and every surface it touches looks like it's remembering something.";

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

// Verbatim from SiteFooter's "Our Studio" blurb, CheckoutPage's order-request
// line, and the SPEC_GROUPS Ordering entry.
export const HOW_IT_WORKS = [
  {
    title: 'Choose',
    text: 'Crystal bead bracelets, faceted by hand one bead at a time. Three colours, each with a story of its own.',
  },
  {
    title: 'Request',
    text: "This is an order request — we'll follow up by email to arrange payment and shipping.",
  },
  {
    title: 'We arrange',
    text: "We'll contact you ourselves to arrange payment and delivery.",
  },
];
