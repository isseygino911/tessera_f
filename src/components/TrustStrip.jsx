import { TRUST } from '@/data/productFacts.js';

import './styles/TrustStrip.css';

export default function TrustStrip() {
  return (
    <section className="trust" aria-label="Why it lasts">
      <ul className="trust__grid">
        {TRUST.map((block) => (
          <li key={block.title}>
            <h3>{block.title}</h3>
            <p>{block.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
