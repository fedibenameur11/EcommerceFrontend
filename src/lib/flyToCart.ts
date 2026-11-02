/**
 * Anime l'image d'un produit qui « vole » jusqu'à l'icône du panier du header
 * (élément portant l'attribut data-cart-target), puis fait rebondir l'icône.
 * Sans effet si l'utilisateur préfère réduire les animations ou si la cible est introuvable.
 */
export function flyToCart(image: HTMLImageElement | null | undefined): void {
  if (!image || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const target = document.querySelector<HTMLElement>('[data-cart-target]');
  if (!target) return;

  const from = image.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  if (from.width === 0 || to.width === 0) return;

  const ghost = image.cloneNode() as HTMLImageElement;
  Object.assign(ghost.style, {
    position: 'fixed',
    left: `${from.left}px`,
    top: `${from.top}px`,
    width: `${from.width}px`,
    height: `${from.height}px`,
    objectFit: 'contain',
    borderRadius: '16px',
    background: 'white',
    boxShadow: '0 12px 30px rgba(0,0,0,.25)',
    pointerEvents: 'none',
    zIndex: '9999',
    transformOrigin: 'center',
  });
  ghost.removeAttribute('loading');
  document.body.appendChild(ghost);

  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);

  const flight = ghost.animate(
    [
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * 0.6}px, ${dy * 0.6 - 60}px) scale(0.5)`, opacity: 0.95, offset: 0.6 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.08)`, opacity: 0.2 },
    ],
    { duration: 750, easing: 'cubic-bezier(0.5, 0, 0.75, 0)' }
  );

  flight.onfinish = () => {
    ghost.remove();
    target.animate(
      [
        { transform: 'scale(1) rotate(0)' },
        { transform: 'scale(1.3) rotate(-12deg)', offset: 0.4 },
        { transform: 'scale(0.95) rotate(6deg)', offset: 0.7 },
        { transform: 'scale(1) rotate(0)' },
      ],
      { duration: 450, easing: 'ease-out' }
    );
  };
  flight.oncancel = () => ghost.remove();
}
