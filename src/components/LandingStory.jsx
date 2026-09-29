import { Fragment, useId, useRef } from 'react';
import { STORY } from '@/data/landingContent.js';
import { useLandingStoryMotion } from '@/hooks/useLandingStoryMotion.js';
import './styles/LandingStory.css';

// "04 / Story": the studio's story, a serif lead line over a few short
// paragraphs, with a scroll line that draws in as the section passes through view.
// On mobile the paragraphs read as numbered chapters; the numbers and hairlines
// are hidden on desktop.
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
        <p className="landing-story__lead" data-m-words>
          {STORY.lead.split(' ').map((word, index) => (
            <Fragment key={`${word}-${index}`}>
              {index > 0 && ' '}
              <span>{word}</span>
            </Fragment>
          ))}
        </p>
        <div className="landing-story__body" data-m-group>
          {STORY.paragraphs.map((paragraph, index) => (
            <div key={paragraph} className="landing-story__chapter">
              <span className="landing-story__chapter-line" data-m-line aria-hidden="true" />
              <span className="landing-story__chapter-num" aria-hidden="true">
                0{index + 1}
              </span>
              <p className="landing-story__text" data-m-rise>
                {paragraph}
              </p>
            </div>
          ))}
        </div>
        <span className="landing-story__signoff-rule" data-m-line="x" aria-hidden="true" />
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
