import { useId, useRef } from 'react';
import { STORY } from '@/data/landingContent.js';
import { useLandingStoryMotion } from '@/hooks/useLandingStoryMotion.js';
import './styles/LandingStory.css';

// "04 / Story": the studio's story, a serif lead line over a few short
// paragraphs, with a scroll line that draws in as the section passes through view.
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
        <p className="landing-story__lead">{STORY.lead}</p>
        <div className="landing-story__body">
          {STORY.paragraphs.map((paragraph) => (
            <p key={paragraph} className="landing-story__text">
              {paragraph}
            </p>
          ))}
        </div>
        <p className="landing-story__signoff">{STORY.signoff}</p>

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
