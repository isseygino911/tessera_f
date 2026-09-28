import { useId, useRef } from 'react';
import { STORY_LINE } from '@/data/landingContent.js';
import { useLandingStoryMotion } from '@/hooks/useLandingStoryMotion.js';
import './styles/LandingStory.css';

// "04 / Story": a centred sentence from the maker's own story copy, with a
// scroll line that draws in as the section passes through view.
export default function LandingStory({ product }) {
  const headingId = useId();
  const rootRef = useRef(null);
  useLandingStoryMotion(rootRef, Boolean(product));

  return (
    <section className="landing-story" id="story" aria-labelledby={headingId} ref={rootRef}>
      <div className="site-container landing-story__inner">
        <p className="eyebrow">04 / Story</p>
        <h2 id={headingId} className="landing-story__title">
          Our Studio
        </h2>
        <p className="landing-story__line">{STORY_LINE}</p>

        <div className="landing-story__scroll">
          <span className="landing-story__scroll-label">Scroll</span>
          <span className="landing-story__scroll-track">
            <span className="landing-story__scroll-fill" data-story-line />
          </span>
        </div>
      </div>
    </section>
  );
}
