# Architecture Frontend E-commerce

Ce document décrit l'architecture et l'organisation du projet frontend React.

## Structure du Projet

```
src/
??? assets/               # Images, icônes, styles
??? components/           # Composants réutilisables
??? context/             # Context API pour l'état global
??? hooks/               # Hooks personnalisés
??? models/              # Modèles TypeScript/interfaces
??? pages/               # Pages de l'application
??? routes/              # Configuration des routes
??? services/            # Services API et stockage
??? store/               # Redux store et slices
??? utils/               # Fonctions utilitaires
??? App.tsx              # Composant racine
??? main.tsx             # Point d'entrée
??? index.css            # Styles globaux
```

## Détails des Dossiers

### `/services`

Services centralisés pour la communication avec l'API backend.

- **`api/`** - Services API
  - `axiosInstance.ts` - Configuration Axios avec intercepteurs
  - `authService.ts` - Authentification (login, register, verify)
  - `productService.ts` - Produits (récupération, recherche, filtrage)
  - `categoryService.ts` - Catégories
  - `cartService.ts` - Panier
  - `orderService.ts` - Commandes
  - `userService.ts` - Utilisateur

- **`storage/`** - Gestion du stockage
  - `tokenService.ts` - Stockage et gestion des tokens JWT

### `/models`

Définitions TypeScript des structures de données.

- `auth/` - Modèles d'authentification
- `product.ts` - Produits et pagination
- `category.ts` - Catégories
- `cart.ts` - Panier et articles
- `order.ts` - Commandes
- `user.ts` - Utilisateur

### `/store`

Gestion d'état Redux.

- **`slices/`**
  - `authSlice.ts` - État d'authentification
  - `cartSlice.ts` - État du panier
  - `categorySlice.ts` - État des catégories
  - `orderSlice.ts` - État des commandes
  - `productSlice.ts` - État des produits
  - `userSlice.ts` - État utilisateur

### `/hooks`

Hooks React personnalisés pour la logique métier.

- `useAuth.ts` - Authentification
- `useProducts.ts` - Produits
- `useCart.ts` - Panier
- `useOrders.ts` - Commandes

### `/routes`

Configuration du routage.

- `AppRoutes.tsx` - Configuration des routes
- `ProtectedRoute.tsx` - Route protégée (authentification requise)
- `AdminRoute.tsx` - Route admin (rôle admin requis)

### `/utils`

Fonctions utilitaires réutilisables.

- `formatCurrency.ts` - Formatage des devises
- `formatDate.ts` - Formatage des dates
- `validators.ts` - Validations (email, mot de passe, etc.)
- `localStorage.ts` - Utilitaires localStorage
- `errorHandler.ts` - Gestion centralisée des erreurs

### `/pages`

Pages complètes de l'application.

- `home/` - Accueil
- `products/` - Liste des produits
- `product-details/` - Détail produit
- `categories/` - Catégories
- `cart/` - Panier
- `checkout/` - Paiement
- `login/` - Connexion
- `register/` - Inscription
- `profile/` - Profil utilisateur
- `orders/` - Historique des commandes
- `not-found/` - 404

### `/context`

Context API pour l'état global.

- `NotificationContext.tsx` - Notifications toast

### `/components`

Composants réutilisables. (Structure existante à compléter)

## Flux de Données

### Authentification
1. L'utilisateur se connecte via `LoginPage`
2. `useAuth` hook appelle `authService.login()`
3. Le token est stocké via `tokenService.setToken()`
4. Redux dispatch `login` action pour mettre à jour l'état
5. Redirection vers page protégée

### Récupération Produits
1. `ProductsPage` utilise `useProducts` hook
2. Hook appelle `productService.getAllProducts()`
3. Redux dispatch `setProducts` action
4. Composants affichent les produits

### Panier
1. `useCart` hook gère l'état du panier
2. Appels API via `cartService`
3. Redux synchronise l'état
4. LocalStorage persiste les données

## Conventions

- **Nommage des fichiers**: kebab-case pour les dossiers, PascalCase pour les composants
- **Services**: Un service par domaine métier
- **Hooks**: Logique métier réutilisable
- **Models**: Interfaces TypeScript pour la sécurité des types
- **Redux**: Actions, reducers, selectors centralisés par domaine

## Configuration Backend

L'API backend doit être disponible à l'URL configurée dans `.env`:

```
VITE_API_BASE_URL=https://localhost:7220/api
```

## Endpoints Attendus

Voir `/services/api/` pour les endpoints attendus du backend.

## Prochaines Étapes

- [ ] Implémenter les composants manquants dans `/components`
- [ ] Intégrer le système de notifications
- [ ] Ajouter la persistance du panier
- [ ] Implémenter le paiement
- [ ] Pages d'administration
- [ ] Tests unitaires et e2e
