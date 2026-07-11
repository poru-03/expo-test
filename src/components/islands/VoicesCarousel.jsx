import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { homepageTestimonials as testimonials } from '../../data/testimonials.js';

const initials = (n) => n.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('');

export default function VoicesCarousel() {
  const [i, setI] = useState(0);
  const timer = useRef(null);
  const n = testimonials.length;

  const go = (d) => setI((prev) => (prev + d + n) % n);

  useEffect(() => {
    timer.current = setInterval(() => setI((p) => (p + 1) % n), 7000);
    return () => clearInterval(timer.current);
  }, [n]);

  const pause = () => clearInterval(timer.current);

  return (
    <div onMouseEnter={pause}>
      <div className="voices2__viewport">
        <div className="voices2__track" style={{ transform: `translateX(-${i * 100}%)` }}>
          {testimonials.map((t) => (
            <div className="voices2__slide" key={t.name}>
              <div className="voices2__photo">
                {t.image
                  ? <img src={t.image} alt={t.name} loading="lazy" />
                  : <span className="team__fallback">{initials(t.name)}</span>}
              </div>
              <div>
                <blockquote className="voices2__quote">“{t.quote}”</blockquote>
                <div className="voices2__name">{t.name}</div>
                <div className="voices2__tag">{t.tagline}</div>
                <div className="voices2__sub">{t.subtext}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="voices2__nav">
        <button className="voices2__btn" onClick={() => go(-1)} aria-label="Previous" type="button"><ArrowLeft size={20} /></button>
        <button className="voices2__btn" onClick={() => go(1)} aria-label="Next" type="button"><ArrowRight size={20} /></button>
      </div>
    </div>
  );
}
