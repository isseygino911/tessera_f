import { useId, useRef, useState } from 'react';
import { CRAFT_TABS } from '@/data/labContent.js';
import { photoAlt, photoUrl } from '@/data/photoManifest.js';
import { MOTION_OK } from '@/lib/motion.js';
import BrandMark from './BrandMark.jsx';
import './styles/LabCraft.css';

const AUTOPLAY_MS = 5000;

// "03 · Why it lasts": a pill tablist that auto-advances every 5s (only under
// MOTION_OK), pausing on hover/focus, with a 3-column stage for the active tab.
export default function LabCraft() {
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
    <section className="lab-craft" id="craft" aria-labelledby={headingId}>
      <div className="lab-container lab-craft__inner">
        <p className="lab-eyebrow">03 · Why it lasts</p>
        <h2 id={headingId} className="lab-craft__title">
          Hand-faceted.
        </h2>

        <div
          className="lab-craft__body"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div
            className="lab-craft__tablist"
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
                  className={`lab-craft__pill${selected ? ' lab-craft__pill--active' : ''}`}
                  onClick={() => handleSelect(index)}
                >
                  <span className="lab-craft__pill-label">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div
            className="lab-craft__stage"
            role="tabpanel"
            id={panelId}
            aria-labelledby={`craft-tab-${active.id}`}
            key={active.id}
          >
            <div className="lab-craft__col lab-craft__col--label">
              <BrandMark />
              <p className="lab-craft__label">{active.label}</p>
            </div>

            <div className="lab-craft__col lab-craft__col--photo">
              <img
                className="lab-craft__photo"
                src={photoUrl(active.photo.slug, active.photo.group, active.photo.scene)}
                alt={photoAlt(active.photo.slug, active.photo.group, active.photo.scene)}
              />
            </div>

            <div className="lab-craft__col lab-craft__col--detail">
              <p className="lab-craft__count">
                0{activeIndex + 1} / 0{CRAFT_TABS.length}
              </p>
              <p className="lab-craft__text">{active.text}</p>
              {autoplay && (
                <span className="lab-craft__progress-track">
                  <span
                    className="lab-craft__progress"
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
