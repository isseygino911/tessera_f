import { useId } from 'react';
import { QUOTES } from '@/data/labContent.js';
import './styles/LabQuotes.css';

// "05 / In the maker's words": 3 pull-quotes taken verbatim from the
// products' own story copy, each cited to its stone.
export default function LabQuotes() {
  const headingId = useId();

  return (
    <section className="lab-quotes" aria-labelledby={headingId}>
      <div className="lab-container lab-quotes__inner">
        <p className="lab-eyebrow">05 / In the maker's words</p>
        <h2 id={headingId} className="lab-quotes__title">
          Their stories.
        </h2>

        <div className="lab-quotes__grid">
          {QUOTES.map((quote) => (
            <blockquote key={quote.slug} className="lab-quotes__quote" data-reveal>
              <p className="lab-quotes__text">&ldquo;{quote.text}&rdquo;</p>
              <cite className="lab-quotes__cite">{quote.name}</cite>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
