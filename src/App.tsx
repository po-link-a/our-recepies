import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeView } from './views/HomeView';
import { CategoryView } from './views/CategoryView';
import { RecipeDetailView } from './views/RecipeDetailView';
import { FavoritesView } from './views/FavoritesView';
import { RECIPES, Recipe } from './data/recipes';

/** Views that are reachable by URL. Anything else falls back to the home page. */
const ROUTES = ['home', 'all', 'favorites', 'recipe', 'category', 'search'];

function parseHash(): { view: string; param?: string } {
  const raw = window.location.hash.replace(/^#\/?/, '');
  if (!raw) return { view: 'home' };
  const [view, ...rest] = raw.split('/');
  if (!ROUTES.includes(view)) return { view: 'home' };
  return { view, param: rest.length ? decodeURIComponent(rest.join('/')) : undefined };
}

function toHash(view: string, param?: string): string {
  if (view === 'home') return '#/';
  return `#/${view}${param ? `/${encodeURIComponent(param)}` : ''}`;
}

export function App() {
  const initial = parseHash();
  const [currentView, setCurrentView] = useState<string>(initial.view);
  const [viewParam, setViewParam] = useState<string | undefined>(initial.param);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [recipesState, setRecipesState] = useState<Recipe[]>(RECIPES);

  // Load saved recipes, and reflect them in the counts
  useEffect(() => {
    try {
      const saved = localStorage.getItem('family_recipes_favorites');
      if (!saved) return;
      const ids: string[] = JSON.parse(saved);
      setFavoriteIds(ids);
      setRecipesState((list) =>
        list.map((r) => (ids.includes(r.id) ? { ...r, likes: r.likes + 1 } : r))
      );
    } catch (e) {
      console.error('LocalStorage error:', e);
    }
  }, []);

  /**
   * One heart, one action: saving a recipe adds it to Избранное and bumps its
   * count, which is what "Самые популярные" sorts by. There is no separate
   * bookmark any more.
   */
  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    setFavoriteIds((prev) => {
      const wasSaved = prev.includes(id);
      const updated = wasSaved ? prev.filter((i) => i !== id) : [...prev, id];
      localStorage.setItem('family_recipes_favorites', JSON.stringify(updated));

      setRecipesState((list) =>
        list.map((r) => (r.id === id ? { ...r, likes: r.likes + (wasSaved ? -1 : 1) } : r))
      );
      return updated;
    });
  };

  // The URL hash is the source of truth, so recipe links can be shared and opened directly.
  useEffect(() => {
    const syncFromHash = () => {
      const { view, param } = parseHash();
      setCurrentView(view);
      setViewParam(param);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const handleNavigate = (view: string, param?: string) => {
    const next = toHash(view, param);
    if (window.location.hash === next || (!window.location.hash && next === '#/')) {
      // Same URL — no hashchange will fire, so move the view ourselves.
      setCurrentView(view);
      setViewParam(param);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    window.location.hash = next;
  };

  // Find active recipe if on recipe detail page
  const selectedRecipe =
    currentView === 'recipe' ? recipesState.find((r) => r.slug === viewParam) : undefined;

  return (
    <div className="app">
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        favoritesCount={favoriteIds.length}
      />

      <main className="app__main">
        {currentView === 'home' && (
          <HomeView
            onNavigate={handleNavigate}
            onToggleLike={handleToggleFavorite}
            onToggleFavorite={handleToggleFavorite}
            likedRecipeIds={favoriteIds}
            favoriteRecipeIds={favoriteIds}
          />
        )}

        {(currentView === 'category' || currentView === 'all' || currentView === 'search') && (
          <CategoryView
            selectedCategory={currentView === 'category' ? viewParam : undefined}
            searchQueryParam={currentView === 'search' ? viewParam : ''}
            onNavigate={handleNavigate}
            onToggleLike={handleToggleFavorite}
            onToggleFavorite={handleToggleFavorite}
            likedRecipeIds={favoriteIds}
            favoriteRecipeIds={favoriteIds}
          />
        )}

        {currentView === 'recipe' && selectedRecipe && (
          <RecipeDetailView
            recipe={selectedRecipe}
            onNavigate={handleNavigate}
            onToggleLike={handleToggleFavorite}
            onToggleFavorite={handleToggleFavorite}
            isLiked={favoriteIds.includes(selectedRecipe.id)}
            isFavorite={favoriteIds.includes(selectedRecipe.id)}
            likedRecipeIds={favoriteIds}
            favoriteRecipeIds={favoriteIds}
          />
        )}

        {currentView === 'recipe' && !selectedRecipe && (
          <div className="container page">
            <div className="empty">
              <h3 className="empty__title">Рецепт не найден</h3>
              <p className="empty__text">
                Возможно, ссылка устарела или рецепт ещё публикуется — это занимает пару минут.
                Попробуйте обновить страницу чуть позже.
              </p>
              <button onClick={() => handleNavigate('all')} className="btn btn--primary">
                Ко всем рецептам
              </button>
            </div>
          </div>
        )}

        {currentView === 'favorites' && (
          <FavoritesView
            favoriteRecipeIds={favoriteIds}
            likedRecipeIds={favoriteIds}
            onNavigate={handleNavigate}
            onToggleLike={handleToggleFavorite}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
