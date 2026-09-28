import { useId } from 'react';
import { QUOTES } from '@/data/landingContent.js';
import './styles/LandingQuotes.css';

// "05 / In the maker's words": pull-quotes taken verbatim from the
// products' own story copy, each cited to its stone.
export default function LandingQuotes({ products }) {
  const headingId = useId();
  // Only quote stones that are on sale.
  const quotes = QUOTES.filter((quote) => products.some((product) => product.slug === quote.slug));

  return (
    <section className="landing-quotes" aria-labelledby={headingId}>
      <div className="site-container landing-quotes__inner">
        <p className="eyebrow">05 / In the maker's words</p>
        <h2 id={headingId} className="landing-quotes__title">
          Their stories.
        </h2>

        <div className="landing-quotes__grid">
          {quotes.map((quote) => (
            <blockquote key={quote.slug} className="landing-quotes__quote" data-reveal>
              <p className="landing-quotes__text">&ldquo;{quote.text}&rdquo;</p>
              <cite className="landing-quotes__cite">{quote.name}</cite>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
