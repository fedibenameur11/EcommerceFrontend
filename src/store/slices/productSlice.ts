import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Category, Product, ProductFilters, SortOption } from '@/types';
import { productApi } from '@/lib/api';
import { getErrorMessage } from '@/utils/errorHandler';

/** Au-delà de ce prix maximum, le filtre est considéré comme « sans limite » côté serveur. */
export const MAX_PRICE_FILTER = 1000;

interface ProductState {
  /** Produits de la page courante (la pagination est faite par le serveur) */
  items: Product[];
  categories: Category[];
  brands: string[];
  selectedProduct: Product | null;
  filters: ProductFilters;
  sortBy: SortOption;
  currentPage: number;
  itemsPerPage: number;
  totalCount: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  /** Identifiant de la dernière requête lancée : les réponses plus anciennes sont ignorées */
  activeRequestId: string | null;
}

const initialState: ProductState = {
  items: [],
  categories: [],
  brands: [],
  selectedProduct: null,
  filters: {
    category: 'all',
    minPrice: 0,
    maxPrice: MAX_PRICE_FILTER,
    search: '',
    brand: 'all',
    gender: 'all',
    size: 'all',
    color: 'all',
    minRating: 0,
  },
  sortBy: 'default',
  currentPage: 1,
  itemsPerPage: 12,
  totalCount: 0,
  totalPages: 0,
  loading: false,
  error: null,
  activeRequestId: null,
};

/**
 * Charge la page de produits correspondant aux filtres, au tri et à la page courante du store.
 */
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { getState, rejectWithValue }) => {
    const { filters, sortBy, currentPage, itemsPerPage } = (getState() as { products: ProductState }).products;
    try {
      return await productApi.getPage({
        page: currentPage,
        pageSize: itemsPerPage,
        search: filters.search.trim() || undefined,
        categoryId: filters.category !== 'all' ? Number(filters.category) : undefined,
        minPrice: filters.minPrice > 0 ? filters.minPrice : undefined,
        maxPrice: filters.maxPrice < MAX_PRICE_FILTER ? filters.maxPrice : undefined,
        brand: filters.brand !== 'all' ? filters.brand : undefined,
        gender: filters.gender !== 'all' ? filters.gender : undefined,
        size: filters.size !== 'all' ? filters.size : undefined,
        color: filters.color !== 'all' ? filters.color : undefined,
        minRating: filters.minRating > 0 ? filters.minRating : undefined,
        sort: sortBy !== 'default' ? sortBy : undefined,
      });
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * Fetch single product by ID
 */
export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await productApi.getById(id);
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error)
      );
    }
  }
);

/**
 * Fetch all categories
 */
export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      return await productApi.getCategories();
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error)
      );
    }
  }
);

/** Charge les marques proposées dans le filtre */
export const fetchBrands = createAsyncThunk('products/fetchBrands', async () => {
  try {
    return await productApi.getBrands();
  } catch {
    return [] as string[];
  }
});

/**
 * Product slice for managing product state
 */
const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    /**
     * Set filter values (retour à la page 1 uniquement si une valeur change vraiment)
     */
    setFilters: (state, action: PayloadAction<Partial<ProductFilters>>) => {
      const next = { ...state.filters, ...action.payload };
      const unchanged = (Object.keys(next) as (keyof ProductFilters)[]).every(
        (key) => next[key] === state.filters[key]
      );
      if (unchanged) return;
      state.filters = next;
      state.currentPage = 1;
    },

    /**
     * Set sort option
     */
    setSortBy: (state, action: PayloadAction<SortOption>) => {
      if (state.sortBy === action.payload) return;
      state.sortBy = action.payload;
      state.currentPage = 1;
    },

    /**
     * Set current page for pagination
     */
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },

    /**
     * Set items per page
     */
    setItemsPerPage: (state, action: PayloadAction<number>) => {
      state.itemsPerPage = action.payload;
      state.currentPage = 1; // Reset to first page
    },

    /**
     * Clear selected product
     */
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },

    /**
     * Reset all filters to default
     */
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.sortBy = initialState.sortBy;
      state.currentPage = 1;
    },
  },
  extraReducers: (builder) => {
    // Fetch products
    builder
      .addCase(fetchProducts.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.activeRequestId = action.meta.requestId;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        // Réponse d'une requête déjà remplacée par une plus récente : on l'ignore
        if (state.activeRequestId !== action.meta.requestId) return;
        state.loading = false;
        state.items = action.payload.items;
        state.totalCount = action.payload.totalCount;
        state.totalPages = action.payload.totalPages;
        // La page demandée n'existe plus (ex. dernier produit supprimé) : on revient sur la dernière
        if (action.payload.totalPages > 0 && state.currentPage > action.payload.totalPages) {
          state.currentPage = action.payload.totalPages;
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        if (state.activeRequestId !== action.meta.requestId) return;
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch product by ID
    builder
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder.addCase(fetchBrands.fulfilled, (state, action) => {
      state.brands = action.payload;
    });

    // Fetch categories (n'affecte pas l'indicateur de chargement des produits)
    builder
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  setFilters,
  setSortBy,
  setCurrentPage,
  setItemsPerPage,
  clearSelectedProduct,
  resetFilters,
} = productSlice.actions;

// Selectors
/** Produits de la page courante */
export const selectProducts = (state: { products: ProductState }) =>
  state.products.items;
export const selectPaginatedProducts = selectProducts;
export const selectCategories = (state: { products: ProductState }) =>
  state.products.categories;
export const selectBrands = (state: { products: ProductState }) =>
  state.products.brands;
export const selectSelectedProduct = (state: { products: ProductState }) =>
  state.products.selectedProduct;
export const selectFilters = (state: { products: ProductState }) =>
  state.products.filters;
export const selectSortBy = (state: { products: ProductState }) =>
  state.products.sortBy;
export const selectCurrentPage = (state: { products: ProductState }) =>
  state.products.currentPage;
export const selectItemsPerPage = (state: { products: ProductState }) =>
  state.products.itemsPerPage;
export const selectLoading = (state: { products: ProductState }) =>
  state.products.loading;
export const selectError = (state: { products: ProductState }) =>
  state.products.error;
/** Nombre total de produits correspondant aux filtres (toutes pages confondues) */
export const selectTotalCount = (state: { products: ProductState }) =>
  state.products.totalCount;
export const selectTotalPages = (state: { products: ProductState }) =>
  state.products.totalPages;

export default productSlice.reducer;
