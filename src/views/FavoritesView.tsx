import React from 'react';
import { Heart, ArrowLeft } from 'lucide-react';
import { RECIPES } from '../data/recipes';
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
    <div className="container page">
      <button onClick={() => onNavigate('home')} className="crumbs" style={{ marginBottom: 10 }}>
        <ArrowLeft size={14} /> На главную
      </button>

      <div className="section-head" style={{ marginBottom: 26 }}>
        <h1 className="hero__title" style={{ fontSize: 52, margin: 0 }}>
          Избранные рецепты
        </h1>
        <span className="count">
          Сохранено: <strong>{favoriteRecipes.length}</strong>
        </span>
      </div>

      <div className="rule-dotted" style={{ marginBottom: 32 }} />

      {favoriteRecipes.length > 0 ? (
        <div className="grid-3">
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
        <div className="empty">
          <span className="empty__icon">
            <Heart size={24} />
          </span>
          <h3 className="empty__title">Список избранного пуст</h3>
          <p className="empty__text">
            Нажмите на иконку закладки на любой карточке рецепта, чтобы сохранить его в личную
            коллекцию.
          </p>
          <button onClick={() => onNavigate('all')} className="btn btn--primary">
            Перейти к рецептам
          </button>
        </div>
      )}
    </div>
  );
};
