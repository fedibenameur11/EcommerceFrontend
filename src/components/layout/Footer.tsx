import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Truck, Banknote, RotateCcw } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { selectCategories } from '@/store/slices/productSlice';

const linkClass = 'text-slate-400 transition-colors hover:text-white';

/**
 * Footer component with links and contact info
 */
export function Footer() {
  const currentYear = new Date().getFullYear();
  const categories = useAppSelector(selectCategories);

  return (
    <footer id="aide" className="bg-slate-950 text-slate-300">
      {/* Engagements */}
      <div className="border-b border-white/10">
        <div className="container mx-auto grid gap-6 px-4 py-8 sm:grid-cols-3">
          {[
            { icon: Truck, title: 'Livraison en Tunisie', text: 'Frais fixes de 10 TND' },
            { icon: Banknote, title: 'Paiement à la livraison', text: 'Aucun paiement en ligne requis' },
            { icon: RotateCcw, title: 'Annulation simple', text: 'Tant que la commande est en attente' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 text-sky-300">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-white">{title}</p>
                <p className="text-sm text-slate-400">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-5">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-600">
                <span className="text-lg font-extrabold text-primary-foreground">T</span>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                Tounsi<span className="text-sky-300">Buy</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Votre boutique en ligne pour des produits de qualité à bon prix. Nous livrons
              l&apos;excellence à chaque commande.
            </p>
          </div>

          {/* Shop Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Boutique</h3>
            <ul className="space-y-2.5 text-sm">
              {categories.slice(0, 5).map((category) => (
                <li key={category.id}>
                  <Link to={`/?category=${category.id}#produits`} className={linkClass}>
                    {category.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/categories" className="font-medium text-sky-300 hover:underline">
                  Toutes les catégories →
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Mon compte</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/profile" className={linkClass}>Mon profil</Link></li>
              <li><Link to="/orders" className={linkClass}>Mes commandes</Link></li>
              <li><Link to="/wishlist" className={linkClass}>Liste de souhaits</Link></li>
              <li><Link to="/cart" className={linkClass}>Panier</Link></li>
              <li><Link to="/checkout" className={linkClass}>Passer commande</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Contactez-nous</h3>
            <ul className="space-y-3.5 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
                <span>123 rue du Commerce, Tunis</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-sky-300" />
                <span>+216 70 000 000</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-sky-300" />
                <a href="mailto:tunsibuysupport@gmail.com" className="transition-colors hover:text-white">
                       tunsibuysupport@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto flex flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-slate-500 sm:flex-row">
          <p>&copy; {currentYear} TounsiBuy. Tous droits réservés.</p>
          <div className="flex gap-5">
            <span className="cursor-pointer transition-colors hover:text-white">
              Politique de confidentialité
            </span>
            <span className="cursor-pointer transition-colors hover:text-white">
              Conditions d&apos;utilisation
            </span>
          </div>
          <p>
            Créé par{' '}
            <a
              href="https://serkanbayraktar.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-sky-300 transition-colors hover:text-sky-200"
            >
              Serkanby
            </a>
            {' | '}
            <a
              href="https://github.com/Serkanbyx"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-sky-300 transition-colors hover:text-sky-200"
            >
              Github
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
