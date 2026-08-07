import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeView } from './views/HomeView';
import { CategoryView } from './views/CategoryView';
import { RecipeDetailView } from './views/RecipeDetailView';
import { FavoritesView } from './views/FavoritesView';
import { RECIPES, Recipe } from './data/recipes';

export function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParam, setViewParam] = useState<string | undefined>(undefined);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [recipesState, setRecipesState] = useState<Recipe[]>(RECIPES);

  // Load likes and favorites from localStorage
  useEffect(() => {
    try {
      const savedLikes = localStorage.getItem('family_recipes_likes');
      if (savedLikes) setLikedIds(JSON.parse(savedLikes));

      const savedFavs = localStorage.getItem('family_recipes_favorites');
      if (savedFavs) setFavoriteIds(JSON.parse(savedFavs));
    } catch (e) {
      console.error('LocalStorage error:', e);
    }
  }, []);

  // Save likes
  const handleToggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedIds((prev) => {
      const isAlreadyLiked = prev.includes(id);
      const updated = isAlreadyLiked ? prev.filter((i) => i !== id) : [...prev, id];
      localStorage.setItem('family_recipes_likes', JSON.stringify(updated));

      // Update recipe object likes count
      setRecipesState((rList) =>
        rList.map((r) => {
          if (r.id === id) {
            return { ...r, likes: isAlreadyLiked ? r.likes - 1 : r.likes + 1 };
          }
          return r;
        })
      );
      return updated;
    });
  };

  // Save favorites
  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteIds((prev) => {
      const isAlreadyFav = prev.includes(id);
      const updated = isAlreadyFav ? prev.filter((i) => i !== id) : [...prev, id];
      localStorage.setItem('family_recipes_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  const handleNavigate = (view: string, param?: string) => {
    setCurrentView(view);
    setViewParam(param);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Find active recipe if on recipe detail page
  const selectedRecipe =
    currentView === 'recipe'
      ? recipesState.find((r) => r.slug === viewParam) || recipesState[0]
      : null;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF6EE] text-[#221F1F]">
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        favoritesCount={favoriteIds.length}
      />

      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            onNavigate={handleNavigate}
            onToggleLike={handleToggleLike}
            onToggleFavorite={handleToggleFavorite}
            likedRecipeIds={likedIds}
            favoriteRecipeIds={favoriteIds}
          />
        )}

        {(currentView === 'category' || currentView === 'all' || currentView === 'search') && (
          <CategoryView
            selectedCategory={currentView === 'category' ? viewParam : undefined}
            searchQueryParam={currentView === 'search' ? viewParam : ''}
            onNavigate={handleNavigate}
            onToggleLike={handleToggleLike}
            onToggleFavorite={handleToggleFavorite}
            likedRecipeIds={likedIds}
            favoriteRecipeIds={favoriteIds}
          />
        )}

        {currentView === 'recipe' && selectedRecipe && (
          <RecipeDetailView
            recipe={selectedRecipe}
            onNavigate={handleNavigate}
            onToggleLike={handleToggleLike}
            onToggleFavorite={handleToggleFavorite}
            isLiked={likedIds.includes(selectedRecipe.id)}
            isFavorite={favoriteIds.includes(selectedRecipe.id)}
            likedRecipeIds={likedIds}
            favoriteRecipeIds={favoriteIds}
          />
        )}

        {currentView === 'favorites' && (
          <FavoritesView
            favoriteRecipeIds={favoriteIds}
            likedRecipeIds={likedIds}
            onNavigate={handleNavigate}
            onToggleLike={handleToggleLike}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
