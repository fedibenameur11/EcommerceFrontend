import type { SVGProps } from 'react';

/**
 * Illustrations SVG des états vides. Elles n'utilisent que les couleurs du thème
 * (via currentColor et des dégradés) et ne chargent aucune image externe.
 */
type ArtProps = SVGProps<SVGSVGElement>;

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-blue`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#60a5fa" />
        <stop offset="100%" stopColor="#4f46e5" />
      </linearGradient>
      <linearGradient id={`${id}-soft`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#e0e7ff" />
        <stop offset="100%" stopColor="#eef2ff" />
      </linearGradient>
    </defs>
  );
}

/** Panier vide */
export function EmptyCartArt(props: ArtProps) {
  return (
    <svg viewBox="0 0 240 200" fill="none" role="img" aria-label="Panier vide" {...props}>
      <Defs id="cart" />
      <ellipse cx="120" cy="182" rx="78" ry="9" fill="#c7d2fe" opacity="0.45" />
      <circle cx="120" cy="96" r="76" fill="url(#cart-soft)" />
      <circle cx="46" cy="52" r="5" fill="#a5b4fc" className="animate-float" />
      <circle cx="198" cy="64" r="7" fill="#93c5fd" className="animate-float [animation-delay:-1s]" />
      <path d="M186 30l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#818cf8" className="animate-float [animation-delay:-2s]" />
      {/* poignée */}
      <path d="M78 72h-14a5 5 0 0 0-5 4l-1 5" stroke="#4f46e5" strokeWidth="6" strokeLinecap="round" />
      {/* corps du panier */}
      <path d="M80 72h104l-12 62a10 10 0 0 1-10 8H102a10 10 0 0 1-10-8z" fill="url(#cart-blue)" />
      <path d="M96 92l5 38M120 92v38M144 92l-5 38M168 92l-5 38" stroke="white" strokeOpacity="0.45" strokeWidth="4" strokeLinecap="round" />
      <circle cx="108" cy="162" r="8" fill="#312e81" />
      <circle cx="108" cy="162" r="3" fill="#c7d2fe" />
      <circle cx="162" cy="162" r="8" fill="#312e81" />
      <circle cx="162" cy="162" r="3" fill="#c7d2fe" />
    </svg>
  );
}

/** Aucun résultat de recherche */
export function NoResultsArt(props: ArtProps) {
  return (
    <svg viewBox="0 0 240 200" fill="none" role="img" aria-label="Aucun résultat" {...props}>
      <Defs id="search" />
      <ellipse cx="120" cy="182" rx="78" ry="9" fill="#c7d2fe" opacity="0.45" />
      <circle cx="120" cy="96" r="76" fill="url(#search-soft)" />
      <circle cx="52" cy="60" r="5" fill="#a5b4fc" className="animate-float" />
      <circle cx="194" cy="52" r="6" fill="#93c5fd" className="animate-float [animation-delay:-1.5s]" />
      {/* cartes produit fantômes */}
      <rect x="62" y="64" width="46" height="58" rx="8" fill="white" stroke="#c7d2fe" strokeWidth="2" strokeDasharray="5 4" />
      <rect x="70" y="72" width="30" height="24" rx="4" fill="#e0e7ff" />
      <rect x="70" y="102" width="30" height="5" rx="2.5" fill="#c7d2fe" />
      <rect x="70" y="111" width="18" height="5" rx="2.5" fill="#e0e7ff" />
      {/* loupe */}
      <g className="origin-center animate-wiggle" style={{ transformOrigin: '146px 112px' }}>
        <circle cx="140" cy="104" r="30" fill="white" fillOpacity="0.9" stroke="url(#search-blue)" strokeWidth="9" />
        <path d="M122 98a20 20 0 0 1 14-12" stroke="#a5b4fc" strokeWidth="4" strokeLinecap="round" />
        <path d="M162 126l26 28" stroke="url(#search-blue)" strokeWidth="12" strokeLinecap="round" />
        <path d="M132 100l16 16M148 100l-16 16" stroke="#818cf8" strokeWidth="5" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/** Aucune commande */
export function EmptyOrdersArt(props: ArtProps) {
  return (
    <svg viewBox="0 0 240 200" fill="none" role="img" aria-label="Aucune commande" {...props}>
      <Defs id="orders" />
      <ellipse cx="120" cy="182" rx="78" ry="9" fill="#c7d2fe" opacity="0.45" />
      <circle cx="120" cy="96" r="76" fill="url(#orders-soft)" />
      <circle cx="50" cy="70" r="5" fill="#a5b4fc" className="animate-float" />
      <path d="M192 44l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#818cf8" className="animate-float [animation-delay:-1s]" />
      {/* carton ouvert */}
      <path d="M62 84l58-22 58 22-58 24z" fill="#a5b4fc" />
      <path d="M62 84v52l58 24V108z" fill="url(#orders-blue)" />
      <path d="M178 84v52l-58 24V108z" fill="#4338ca" />
      <path d="M62 84l-12-18 58-20 12 16z" fill="#c7d2fe" />
      <path d="M178 84l12-18-58-20-12 16z" fill="#e0e7ff" />
      <rect x="104" y="116" width="32" height="8" rx="4" fill="white" fillOpacity="0.55" transform="rotate(20 120 120)" />
    </svg>
  );
}

/** Liste de souhaits vide */
export function EmptyWishlistArt(props: ArtProps) {
  return (
    <svg viewBox="0 0 240 200" fill="none" role="img" aria-label="Aucun favori" {...props}>
      <Defs id="heart" />
      <ellipse cx="120" cy="182" rx="78" ry="9" fill="#fecdd3" opacity="0.5" />
      <circle cx="120" cy="96" r="76" fill="#fff1f2" />
      <circle cx="52" cy="62" r="5" fill="#fda4af" className="animate-float" />
      <circle cx="196" cy="70" r="6" fill="#fda4af" className="animate-float [animation-delay:-1.2s]" />
      <path d="M176 34c3-5 10-4 11 2s-6 9-11 13c-5-4-12-7-11-13s8-7 11-2z" fill="#fb7185" className="animate-float [animation-delay:-2s]" />
      <g className="animate-heart-beat" style={{ transformOrigin: '120px 104px', animationIterationCount: 'infinite', animationDuration: '2.4s' }}>
        <path
          d="M120 148C84 124 66 104 66 82c0-16 12-28 28-28 10 0 20 5 26 14 6-9 16-14 26-14 16 0 28 12 28 28 0 22-18 42-54 66z"
          fill="#f43f5e"
        />
        <path d="M84 70c3-6 9-9 15-8" stroke="white" strokeOpacity="0.6" strokeWidth="5" strokeLinecap="round" />
      </g>
    </svg>
  );
}
