import { useState } from 'react';
import { ArrowLeft, ArrowRight, Linkedin, Mail } from 'lucide-react';
import { team } from '../../data/team.js';

export default function TeamCarousel() {
  const [i, setI] = useState(0);
  const m = team[i];
  const prev = () => setI((i - 1 + team.length) % team.length);
  const next = () => setI((i + 1) % team.length);

  return (
    <div className="team__stage">
      <div className="team__card">
        {m.image
          ? <img src={m.image} alt={m.name} />
          : <span className="team__fallback">{m.idx}</span>}
      </div>
      <div>
        <span className="team__idx">{m.idx} / 17</span>
        <h3 className="team__name">{m.name}</h3>
        <p className="team__role">{m.role}</p>

        {(m.linkedin || m.email) && (
          <div className="team__contact">
            {m.linkedin && <a href={m.linkedin} target="_blank" rel="noopener" aria-label="LinkedIn"><Linkedin size={20} /></a>}
            {m.email && <a href={`mailto:${m.email}`} aria-label="Email"><Mail size={20} /></a>}
          </div>
        )}

        <div className="team__progress"><span style={{ width: `${((i + 1) / team.length) * 100}%` }} /></div>

        <div className="team__nav">
          <button className="team__btn" onClick={prev} aria-label="Previous member" type="button"><ArrowLeft size={20} /></button>
          <button className="team__btn" onClick={next} aria-label="Next member" type="button"><ArrowRight size={20} /></button>
        </div>
      </div>
    </div>
  );
}
