import { useId, useRef } from 'react';
import { STORY_LINE } from '@/data/labContent.js';
import { useLabStoryMotion } from '@/hooks/useLabStoryMotion.js';
import './styles/LabStory.css';

// "04 / Story": a centred sentence from the maker's own story copy, with a
// scroll line that draws in as the section passes through view.
export default function LabStory({ product }) {
  const headingId = useId();
  const rootRef = useRef(null);
  useLabStoryMotion(rootRef, Boolean(product));

  return (
    <section className="lab-story" id="story" aria-labelledby={headingId} ref={rootRef}>
      <div className="lab-container lab-story__inner">
        <p className="lab-eyebrow">04 / Story</p>
        <h2 id={headingId} className="lab-story__title">
          Our Studio
        </h2>
        <p className="lab-story__line">{STORY_LINE}</p>

        <div className="lab-story__scroll">
          <span className="lab-story__scroll-label">Scroll</span>
          <span className="lab-story__scroll-track">
            <span className="lab-story__scroll-fill" data-story-line />
          </span>
        </div>
      </div>
    </section>
  );
}
