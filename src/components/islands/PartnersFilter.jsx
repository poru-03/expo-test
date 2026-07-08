import { useState } from 'react';
import { partners, tiers } from '../../data/partners.js';

const monogram = (n) => n.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('');

export default function PartnersFilter() {
  const [active, setActive] = useState('All');
  const list = active === 'All' ? partners : partners.filter((p) => p.tier === active.toLowerCase());

  return (
    <>
      <div className="partners__filter">
        {tiers.map((t) => (
          <button
            key={t}
            className="filter-btn"
            data-active={active === t}
            onClick={() => setActive(t)}
            type="button"
          >
            {t}
          </button>
        ))}
      </div>
      <div className="partners__grid">
        {list.map((p) => (
          <div className="partner-card" key={p.name}>
            <span className="partner-card__tier">{p.tier}</span>
            {p.logo
              ? <img src={p.logo} alt={p.name} loading="lazy" />
              : <span className="partner-card__fallback">{monogram(p.name)}</span>}
          </div>
        ))}
      </div>
    </>
  );
}
