import React from 'react';
import { RECIPES, CATEGORIES, plural, recipeCount } from '../data/recipes';
import { CategoryIcon } from '../components/Illustrations';
import { RecipeCard } from '../components/RecipeCard';
import { AdPlaceholder } from '../components/AdPlaceholder';

interface HomeViewProps {
  onNavigate: (view: string, param?: string) => void;
  onToggleLike: (id: string, e: React.MouseEvent) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  likedRecipeIds: string[];
  favoriteRecipeIds: string[];
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onToggleLike,
  onToggleFavorite,
  likedRecipeIds,
  favoriteRecipeIds,
}) => {
  // Recipe of the day (deterministic based on day of year)
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  const recipeOfTheDay = RECIPES[dayOfYear % RECIPES.length];

  // Top Most Popular (by likes)
  const popularRecipes = [...RECIPES].sort((a, b) => b.likes - a.likes).slice(0, 6);

  // Recently Added
  const recentRecipes = [...RECIPES].slice(0, 6);

  const renderCards = (list: typeof RECIPES) =>
    list.map((recipe) => (
      <RecipeCard
        key={recipe.id}
        recipe={recipe}
        onSelect={(slug) => onNavigate('recipe', slug)}
        onToggleLike={onToggleLike}
        onToggleFavorite={onToggleFavorite}
        isLiked={likedRecipeIds.includes(recipe.id)}
        isFavorite={favoriteRecipeIds.includes(recipe.id)}
      />
    ));

  return (
    <div>
      {/* Hero */}
      <div className="hero-band">
      <section className="container hero">
        <div className="hero__grid">
          <div>
            <span className="kicker">Душевные семейные рецепты</span>
            <h1 className="hero__title">Бабушкина шкатулка рецептов</h1>
            <p className="hero__lede">
              {RECIPES.length} {plural(RECIPES.length, 'драгоценный', 'драгоценных', 'драгоценных')}{' '}
              {plural(RECIPES.length, 'рецепт', 'рецепта', 'рецептов')} из семейных архивных выписок,
              старых газетных вырезок и тетрадей
            </p>
            <div className="hero__actions">
              <button onClick={() => onNavigate('all')} className="btn btn--primary">
                Смотреть все {recipeCount()}
              </button>
            </div>
          </div>

          <div className="hero__art">
            <img src="/hero.jpg" alt="" className="hero__img" />
          </div>
        </div>
      </section>
      </div>

      <div className="container stack-lg" style={{ paddingTop: 40, paddingBottom: 8 }}>
        {/* Ad Placeholder 1: Below Hero */}
        <AdPlaceholder type="hero_below" />

        {/* Recipe of the Day */}
        <section className="feature">
          <div className="feature__head">
            <span className="chip chip--lg" style={{ backgroundColor: 'var(--peach)' }}>
              Рецепт дня
            </span>
            <span className="ad-size">Обновляется ежедневно</span>
          </div>

          <div className="feature__grid">
            <div>
              {/* Same chip + language tag as the cards, so tags read alike everywhere */}
              <div className="feature__tags">
                <span
                  className="chip"
                  style={{ backgroundColor: CATEGORIES[recipeOfTheDay.category]?.bgColor }}
                >
                  <CategoryIcon
                    name={CATEGORIES[recipeOfTheDay.category]?.iconName || 'waffle'}
                    size={16}
                  />
                  {recipeOfTheDay.categoryName}
                </span>
                <span className="lang-tag">{recipeOfTheDay.language}</span>
              </div>
              <h2 className="feature__title">{recipeOfTheDay.title}</h2>
              <p className="feature__text">
                {recipeOfTheDay.sourceNote} — {recipeOfTheDay.directions[0]}
              </p>
            </div>
            <button
              onClick={() => onNavigate('recipe', recipeOfTheDay.slug)}
              className="btn btn--primary"
            >
              Приготовить
            </button>
          </div>
        </section>

        {/* Categories */}
        <section>
          <div className="section-head">
            <h2 className="section-title">Категории кулинарии</h2>
          </div>

          <div className="grid-cats">
            {Object.values(CATEGORIES).map((cat) => (
              <button
                key={cat.id}
                onClick={() => onNavigate('category', cat.id)}
                className="cat-tile"
              >
                <span className="cat-tile__icon" style={{ backgroundColor: cat.bgColor }}>
                  <CategoryIcon name={cat.iconName} size={28} />
                </span>
                <span className="cat-tile__name">{cat.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Most Popular */}
        <section>
          <div className="section-head">
            <h2 className="section-title">Самые популярные</h2>
            <button onClick={() => onNavigate('all')} className="section-link">
              Смотреть все →
            </button>
          </div>
          <div className="grid-3">{renderCards(popularRecipes)}</div>
        </section>

        {/* Ad Placeholder 2: Section Between */}
        <AdPlaceholder type="section_between" />
      </div>

      {/* Recently Added */}
      <div className="container" style={{ paddingTop: 56, paddingBottom: 8 }}>
        <section>
          <div className="section-head">
            <h2 className="section-title">Недавно добавленные</h2>
            <button onClick={() => onNavigate('all')} className="section-link">
              Все рецепты →
            </button>
          </div>
          <div className="grid-3">{renderCards(recentRecipes)}</div>
        </section>
      </div>
    </div>
  );
};
