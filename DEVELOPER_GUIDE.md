# Guide de Développement Frontend

## Installation

```bash
# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.local.example .env.local
# Éditer .env.local avec les bonnes valeurs
```

## Démarrage du Projet

```bash
# Mode développement
npm run dev

# Build production
npm run build

# Prévisualiser le build
npm run preview
```

## Architecture et Organisation

Voir [ARCHITECTURE.md](./ARCHITECTURE.md) pour une description détaillée de la structure du projet.

## Conventions de Code

### Nommage des Fichiers

- **Composants React**: `PascalCase.tsx`
  - Exemple: `ProductCard.tsx`, `CartItem.tsx`

- **Services, Hooks, Utils**: `camelCase.ts`
  - Exemple: `productService.ts`, `useCart.ts`

- **Dossiers**: `kebab-case`
  - Exemple: `product-card/`, `shopping-cart/`

### Nommage des Variables et Fonctions

- **Variables et Fonctions**: `camelCase`
  - Exemple: `const isLoading = false;`, `function handleSubmit() {}`

- **Constantes**: `UPPER_SNAKE_CASE`
  - Exemple: `const API_BASE_URL = '...';`

- **Types/Interfaces**: `PascalCase`
  - Exemple: `interface User {}`, `type OrderStatus = ...`

## Utilisation des Services API

### Exemple: Récupérer les Produits

```typescript
import { productService } from '@/services';

// Dans un composant ou hook
const response = await productService.getAllProducts(1, 10);
```

### Exemple: Authentification

```typescript
import { authService } from '@/services';

const response = await authService.login({
  email: 'user@example.com',
  password: 'password123',
});

// Stocker le token
import { setToken } from '@/services/storage/tokenService';
setToken(response.token);
```

## Utilisation de Redux

### Créer une Action

```typescript
// Dans un slice (slices/productSlice.ts)
const { setProducts, setLoading, setError } = productSlice.actions;

// Utiliser dans un composant
dispatch(setProducts(products));
```

### Accéder à l'État

```typescript
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';

const { products, loading } = useSelector((state: RootState) => state.products);
```

## Utilisation des Hooks Personnalisés

### useAuth

```typescript
import { useAuth } from '@/hooks';

const { user, isAuthenticated, login, logout } = useAuth();

await login({ email, password });
logout();
```

### useProducts

```typescript
import { useProducts } from '@/hooks';

const { products, loading, error, fetchProducts } = useProducts();

useEffect(() => {
  fetchProducts(1, 10);
}, []);
```

### useCart

```typescript
import { useCart } from '@/hooks';

const { items, totalPrice, addToCart, removeFromCart } = useCart();

await addToCart(productId, quantity);
```

## Gestion des Erreurs

### Utiliser le Utility d'Erreur

```typescript
import { parseError, logError } from '@/utils/errorHandler';

try {
  await someApiCall();
} catch (error) {
  const appError = parseError(error);
  logError(error, 'MyComponent');
  // Afficher le message à l'utilisateur
}
```

## Validation des Formulaires

```typescript
import { isValidEmail, isValidPassword } from '@/utils/validators';

if (!isValidEmail(email)) {
  // Afficher erreur
}
```

## Formatage

### Devises

```typescript
import { formatPrice } from '@/utils/formatCurrency';

console.log(formatPrice(1500)); // 1 500,00 DZD
```

### Dates

```typescript
import { formatDate, formatTimeAgo } from '@/utils/formatDate';

console.log(formatDate('2024-01-15')); // 15/01/2024
console.log(formatTimeAgo('2024-01-15')); // Il y a X jours
```

## Types et Interfaces

Importer les types depuis le dossier `models/`:

```typescript
import type { Product, Category, Order, Cart } from '@/models';
```

## Tests

```bash
# Exécuter les tests
npm run test

# Mode watch
npm run test:watch
```

## Linting

```bash
# Vérifier le code
npm run lint

# Corriger automatiquement
npm run lint:fix
```

## Intégration Backend

L'API backend devrait être accessible à l'URL configurée dans `.env.local`:

```
VITE_API_BASE_URL=https://localhost:7220/api
```

### Endpoints Requis

Voir [ARCHITECTURE.md](./ARCHITECTURE.md#endpoints-attendus) pour la liste complète.

## Ajouter une Nouvelle Feature

### 1. Créer le Modèle TypeScript

```typescript
// models/myFeature.ts
export interface MyFeature {
  id: string;
  name: string;
}
```

### 2. Créer le Service API

```typescript
// services/api/myFeatureService.ts
export const myFeatureService = {
  getAll: async () => { /* ... */ },
  getById: async (id: string) => { /* ... */ },
};
```

### 3. Créer le Slice Redux (optionnel)

```typescript
// store/slices/myFeatureSlice.ts
export const myFeatureSlice = createSlice({
  name: 'myFeature',
  // ...
});
```

### 4. Créer un Hook Personnalisé (optionnel)

```typescript
// hooks/useMyFeature.ts
export const useMyFeature = () => {
  // ...
};
```

### 5. Utiliser dans les Composants

```typescript
import { useMyFeature } from '@/hooks';

export function MyComponent() {
  const { data, loading } = useMyFeature();
  // ...
}
```

## Debugging

### Utiliser les Outils de Développement

- React DevTools (Chrome Extension)
- Redux DevTools (Chrome Extension)
- Vue les logs console (F12 ou Cmd+Option+J)

### Logs de Développement

```typescript
import { logError } from '@/utils/errorHandler';

logError(error, 'ComponentName');
```

## Bonnes Pratiques

1. **Réutilisabilité**: Créer des composants génériques et des hooks réutilisables
2. **Performance**: Utiliser `React.memo()`, `useCallback()`, `useMemo()`
3. **Types**: Toujours ajouter les types TypeScript
4. **Erreurs**: Toujours gérer les erreurs API
5. **Commentaires**: Documenter les fonctions complexes
6. **Tests**: Écrire des tests pour la logique critique

## Ressources

- [React Documentation](https://react.dev)
- [Redux Toolkit](https://redux-toolkit.js.org)
- [TypeScript](https://www.typescriptlang.org)
- [Axios](https://axios-http.com)
- [React Router](https://reactrouter.com)
