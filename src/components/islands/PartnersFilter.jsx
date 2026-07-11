import { partners } from '../../data/partners.js';

const monogram = (n) => n.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('');

function Row({ ariaHidden }) {
  return (
    <div className="marquee__row" aria-hidden={ariaHidden || undefined}>
      {partners.map((p, i) => (
        <div className="partner-chip" key={`${p.name}-${i}`}>
          {p.logo
            ? <img src={p.logo} alt={p.name} loading="lazy" />
            : <span className="partner-chip__mono">{monogram(p.name)}</span>}
          <span className="partner-chip__name">{p.name}</span>
        </div>
      ))}
    </div>
  );
}

export default function PartnersFilter() {
  return (
    <div className="marquee" role="list" aria-label="Partner organisations">
      <div className="marquee__track">
        <Row />
        <Row ariaHidden />
      </div>
    </div>
  );
}
