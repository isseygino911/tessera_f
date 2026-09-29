import { useId, useRef, useState } from 'react';
import { CRAFT_TABS } from '@/data/landingContent.js';
import { MOTION_OK } from '@/lib/motion.js';
import BrandMark from './BrandMark.jsx';
import './styles/LandingCraft.css';

const AUTOPLAY_MS = 5000;

// "03 · Why it lasts": a pill tablist that auto-advances every 5s (only under
// MOTION_OK), pausing on hover/focus, over a looping bracelet video. Reduced
// motion gets the video's still poster instead.
export default function LandingCraft() {
  const headingId = useId();
  const panelId = useId();
  const tablistRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplay] = useState(() => window.matchMedia(MOTION_OK).matches);
  const [paused, setPaused] = useState(false);

  const active = CRAFT_TABS[activeIndex];

  function scrollTabIntoView(index) {
    const strip = tablistRef.current;
    const pill = strip?.children[index];
    if (!strip || !pill || typeof strip.scrollTo !== 'function') return;
    const target = pill.offsetLeft - strip.clientWidth / 2 + pill.clientWidth / 2;
    strip.scrollTo({ left: target, behavior: 'smooth' });
  }

  function handleSelect(index) {
    setActiveIndex(index);
    scrollTabIntoView(index);
  }

  function handleAnimationEnd() {
    setActiveIndex((index) => {
      const next = (index + 1) % CRAFT_TABS.length;
      scrollTabIntoView(next);
      return next;
    });
  }

  return (
    <section className="landing-craft" id="craft" aria-labelledby={headingId}>
      <video
        className="landing-craft__video"
        src="/videos/craft.mp4"
        poster="/videos/craft-poster.jpg"
        autoPlay={autoplay}
        muted
        loop
        playsInline
        aria-hidden="true"
      />
      <div className="site-container landing-craft__inner">
        <p className="eyebrow">03 · Why it lasts</p>
        <h2 id={headingId} className="landing-craft__title">
          Hand-faceted.
        </h2>

        <div
          className="landing-craft__body"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div
            className="landing-craft__tablist"
            role="tablist"
            aria-label="Why it lasts"
            ref={tablistRef}
          >
            {CRAFT_TABS.map((tab, index) => {
              const selected = index === activeIndex;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  id={`craft-tab-${tab.id}`}
                  aria-selected={selected}
                  aria-controls={panelId}
                  className={`landing-craft__pill${selected ? ' landing-craft__pill--active' : ''}`}
                  onClick={() => handleSelect(index)}
                >
                  <span className="landing-craft__pill-label">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div
            className="landing-craft__stage"
            role="tabpanel"
            id={panelId}
            aria-labelledby={`craft-tab-${active.id}`}
          >
            {/* The keys fade the columns in per tab. */}
            <div
              className="landing-craft__col landing-craft__col--label"
              key={`label-${active.id}`}
            >
              <BrandMark />
              <p className="landing-craft__label">{active.label}</p>
            </div>

            <div
              className="landing-craft__col landing-craft__col--detail"
              key={`detail-${active.id}`}
            >
              <p className="landing-craft__count">
                0{activeIndex + 1} / 0{CRAFT_TABS.length}
              </p>
              <p className="landing-craft__text">{active.text}</p>
              {autoplay && (
                <span className="landing-craft__progress-track">
                  <span
                    className="landing-craft__progress"
                    style={{
                      animationDuration: `${AUTOPLAY_MS}ms`,
                      animationPlayState: paused ? 'paused' : 'running',
                    }}
                    onAnimationEnd={handleAnimationEnd}
                  />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
