import { partners } from '../../data/partners.js';

const monogram = (n) => n.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('');

export default function PartnersFilter() {
  return (
    <div className="partners__grid">
      {partners.map((p) => (
        <div className="partner-card" key={p.name}>
          {p.logo
            ? <img src={p.logo} alt={p.name} loading="lazy" />
            : <span className="partner-card__fallback">{monogram(p.name)}</span>}
        </div>
      ))}
    </div>
  );
}
