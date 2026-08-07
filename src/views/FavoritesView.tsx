import React from 'react';
import { Heart, BookOpen, ArrowLeft } from 'lucide-react';
import { RECIPES, Recipe } from '../data/recipes';
import { RecipeCard } from '../components/RecipeCard';

interface FavoritesViewProps {
  favoriteRecipeIds: string[];
  likedRecipeIds: string[];
  onNavigate: (view: string, param?: string) => void;
  onToggleLike: (id: string, e: React.MouseEvent) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favoriteRecipeIds,
  likedRecipeIds,
  onNavigate,
  onToggleLike,
  onToggleFavorite,
}) => {
  const favoriteRecipes = RECIPES.filter((r) => favoriteRecipeIds.includes(r.id));

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <div>
          <button
            onClick={() => onNavigate('home')}
            className="text-xs font-semibold text-stone-500 hover:text-[#D93A2B] flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> На главную
          </button>
          <h1 className="font-serif text-3xl font-bold text-stone-900 flex items-center gap-2">
            <Heart className="w-7 h-7 fill-[#D93A2B] text-[#D93A2B]" /> Избранные рецепты
          </h1>
        </div>
        <span className="text-xs font-mono text-stone-500">
          Сохранено: <strong className="text-stone-900 text-sm">{favoriteRecipes.length}</strong>
        </span>
      </div>

      {favoriteRecipes.length > 0 ? (
        <div className="recipe-grid">
          {favoriteRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onSelect={(slug) => onNavigate('recipe', slug)}
              onToggleLike={onToggleLike}
              onToggleFavorite={onToggleFavorite}
              isLiked={likedRecipeIds.includes(recipe.id)}
              isFavorite={true}
            />
          ))}
        </div>
      ) : (
        <div className="paper-card p-12 text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#FAF6EE] border-2 border-stone-300 flex items-center justify-center mx-auto text-stone-400">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-xl font-bold text-stone-900">Список избранного пуст</h3>
          <p className="text-sm text-stone-600">
            Нажмите на иконку закладки на любой карточке рецепта, чтобы сохранить его в личную коллекцию.
          </p>
          <button onClick={() => onNavigate('all')} className="btn-primary">
            Перейти к рецептам
          </button>
        </div>
      )}
    </div>
  );
};
