import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, ArrowRight, Linkedin, Mail } from 'lucide-react';
import { team } from '../../data/team.js';

const N = team.length;
const SLOTS = [-2, -1, 0, 1, 2];
const AUTO_INTERVAL = 3200; // ms between auto-advances

export default function TeamCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  const next = useCallback(() => setActive((a) => (a + 1) % N), []);
  const prev = useCallback(() => setActive((a) => (a - 1 + N) % N), []);

  // Auto-advance — pauses on hover / focus
  useEffect(() => {
    if (paused) {
      clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(next, AUTO_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [paused, next]);

  return (
    <div
      className="team-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* 5-card track: far-left, left, active, right, far-right */}
      <div className="team-carousel__track" aria-label="Organising Committee">
        {SLOTS.map((offset) => {
          const idx = (active + offset + N) % N;
          const m = team[idx];
          const isActive = offset === 0;
          const isFar = Math.abs(offset) === 2;

          let cls = 'team-mc-card';
          if (isActive) cls += ' team-mc-card--active';
          if (isFar) cls += ' team-mc-card--far';

          return (
            <div
              key={offset}
              className={cls}
              onClick={() => !isActive && setActive(idx)}
              style={{ cursor: isActive ? 'default' : 'pointer' }}
              role={isActive ? undefined : 'button'}
              tabIndex={isActive ? undefined : 0}
              onKeyDown={(e) => {
                if (!isActive && (e.key === 'Enter' || e.key === ' ')) setActive(idx);
              }}
              aria-label={isActive ? undefined : `View ${m.name}`}
            >
              <div className="team-mc-card__photo">
                {m.image
                  ? <img src={m.image} alt={m.name} />
                  : <span className="team__fallback">{m.idx}</span>}
                {isActive && (m.linkedin || m.email) && (
                  <div className="team-mc-card__links">
                    {m.linkedin && (
                      <a href={m.linkedin} target="_blank" rel="noopener" aria-label={`${m.name} on LinkedIn`}>
                        <Linkedin size={16} />
                      </a>
                    )}
                    {m.email && (
                      <a href={`mailto:${m.email}`} aria-label={`Email ${m.name}`}>
                        <Mail size={16} />
                      </a>
                    )}
                  </div>
                )}
              </div>
              <div className="team-mc-card__info">
                <p className="team-mc-card__name">{m.name}</p>
                <p className="team-mc-card__role">{m.role}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="team-carousel__footer">
        <div className="team-carousel__nav">
          <button className="team__btn" onClick={prev} aria-label="Previous member" type="button">
            <ArrowLeft size={18} />
          </button>
          <span className="team-carousel__count label">
            {String(active + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}
          </span>
          <button className="team__btn" onClick={next} aria-label="Next member" type="button">
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Dot indicators — click any to jump */}
        <div className="team-carousel__dots" role="tablist" aria-label="Team members">
          {team.map((_, idx) => (
            <button
              key={idx}
              className={`team-carousel__dot${idx === active ? ' team-carousel__dot--active' : ''}`}
              onClick={() => setActive(idx)}
              aria-label={`Member ${idx + 1}`}
              aria-selected={idx === active}
              role="tab"
              type="button"
            />
          ))}
        </div>

        {/* Auto-play progress bar */}
        <div className="team__progress" aria-hidden="true">
          <span style={{ width: `${((active + 1) / N) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}
