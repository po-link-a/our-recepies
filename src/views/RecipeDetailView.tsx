import React, { useState } from 'react';
import {
  Heart,
  Bookmark,
  Share2,
  Printer,
  Download,
  Play,
  ChevronRight,
  Check,
} from 'lucide-react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { Recipe, RECIPES, CATEGORIES } from '../data/recipes';
import { CategoryIcon, DecorativeDoodle } from '../components/Illustrations';
import { RecipeCard } from '../components/RecipeCard';
import { AdPlaceholder } from '../components/AdPlaceholder';
import { CookingModeModal } from '../components/CookingModeModal';

interface RecipeDetailViewProps {
  recipe: Recipe;
  onNavigate: (view: string, param?: string) => void;
  onToggleLike: (id: string, e: React.MouseEvent) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  isLiked: boolean;
  isFavorite: boolean;
  likedRecipeIds: string[];
  favoriteRecipeIds: string[];
}

export const RecipeDetailView: React.FC<RecipeDetailViewProps> = ({
  recipe,
  onNavigate,
  onToggleLike,
  onToggleFavorite,
  isLiked,
  isFavorite,
  likedRecipeIds,
  favoriteRecipeIds,
}) => {
  const [portionMultiplier, setPortionMultiplier] = useState<number>(1);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});
  const [isCookingModeOpen, setIsCookingModeOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const categoryInfo = CATEGORIES[recipe.category];
  const totalTime = (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);
  const hasAmounts = recipe.ingredients.some((i) => i.amount);

  // Related recipes from same category
  const relatedRecipes = RECIPES.filter(
    (r) => r.category === recipe.category && r.id !== recipe.id
  ).slice(0, 4);

  const toggleIngredientCheck = (idx: number) => {
    setCheckedIngredients((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Copy link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Generate Word (.docx) export
  const handleDownloadDocx = async () => {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: recipe.title,
              heading: HeadingLevel.TITLE,
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Категория: ${recipe.categoryName} | Источник: ${recipe.sourceNote}`,
                  italics: true,
                }),
              ],
            }),
            new Paragraph({ text: '' }),
            new Paragraph({
              text: 'Ингредиенты:',
              heading: HeadingLevel.HEADING_2,
            }),
            ...recipe.ingredients.map((ing) => {
              const amountStr = ing.amount
                ? ` ${Math.round(ing.amount * portionMultiplier * 100) / 100} ${ing.unit || ''}`
                : '';
              const noteStr = ing.note ? ` (${ing.note})` : '';
              return new Paragraph({
                text: `• ${ing.name}${amountStr}${noteStr}`,
              });
            }),
            new Paragraph({ text: '' }),
            new Paragraph({
              text: 'Приготовление:',
              heading: HeadingLevel.HEADING_2,
            }),
            ...recipe.directions.map((step, idx) => {
              return new Paragraph({
                text: `${idx + 1}. ${step}`,
              });
            }),
            new Paragraph({ text: '' }),
            new Paragraph({
              children: [
                new TextRun({
                  text: '— Семейная коллекция рецептов (our-recepies)',
                  size: 18,
                  italics: true,
                  color: '888888',
                }),
              ],
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recipe.slug}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container page">
      {/* Breadcrumbs */}
      <nav className="crumbs no-print">
        <button onClick={() => onNavigate('home')}>Главная</button>
        <ChevronRight size={12} />
        <button onClick={() => onNavigate('category', recipe.category)}>
          {recipe.categoryName}
        </button>
        <ChevronRight size={12} />
        <span className="crumbs__current">{recipe.title}</span>
      </nav>

      <article className="detail" style={{ marginTop: 28 }}>
        {/* Head */}
        <header className="detail__head">
          <span className="kicker">{recipe.sourceNote}</span>
          <h1 className="detail__title">{recipe.title}</h1>

          <div className="detail__pills">
            {totalTime > 0 && <span className="detail__pill">{totalTime} мин</span>}
            {recipe.servings && (
              <span className="detail__pill">
                {Math.round(recipe.servings * portionMultiplier)} порций
              </span>
            )}
            <span className="chip chip--lg" style={{ backgroundColor: categoryInfo?.bgColor }}>
              <CategoryIcon name={categoryInfo?.iconName || 'waffle'} size={16} />
              {recipe.categoryName}
            </span>
            <span className="lang-tag" style={{ alignSelf: 'center' }}>
              {recipe.language}
            </span>
          </div>

          {/* Actions */}
          <div className="detail__tools no-print" style={{ marginTop: 22 }}>
            <button onClick={() => setIsCookingModeOpen(true)} className="btn btn--primary btn--sm">
              <Play size={14} fill="currentColor" /> Режим готовки
            </button>

            <button onClick={(e) => onToggleLike(recipe.id, e)} className="btn btn--ghost btn--sm">
              <Heart size={14} fill={isLiked ? '#D93A2B' : 'none'} color={isLiked ? '#D93A2B' : 'currentColor'} />
              {recipe.likes}
            </button>

            <button
              onClick={(e) => onToggleFavorite(recipe.id, e)}
              className="icon-btn icon-btn--sm"
              title="В избранное"
            >
              <Bookmark size={16} fill={isFavorite ? '#D93A2B' : 'none'} color={isFavorite ? '#D93A2B' : 'currentColor'} />
            </button>

            <button onClick={handleCopyLink} className="icon-btn icon-btn--sm" title="Поделиться">
              {copiedLink ? <Check size={16} /> : <Share2 size={16} />}
            </button>

            <button onClick={handlePrint} className="icon-btn icon-btn--sm" title="Распечатать">
              <Printer size={16} />
            </button>
          </div>

          <div className="detail__tools no-print" style={{ marginTop: 12 }}>
            <button onClick={handleDownloadDocx} className="btn btn--ghost btn--xs">
              <Download size={13} /> Скачать Word (.docx)
            </button>
            <button onClick={handlePrint} className="btn btn--ghost btn--xs">
              <Download size={13} /> Сохранить в PDF / Друк
            </button>
          </div>
        </header>

        {/* Incomplete scan warning */}
        {recipe.isIncomplete && (
          <div className="warn" style={{ marginTop: 28 }}>
            <span>
              <strong>Неполный архивный скан:</strong>{' '}
              {recipe.incompleteNote || 'Фрагмент рецепта обрезается на скане.'}
            </span>
          </div>
        )}

        <div className="rule-dashy" style={{ margin: '40px 0' }} />

        {/* Body */}
        <div className="detail__body">
          {/* Ingredients */}
          <aside className="detail__aside">
            <h2 className="block-title">
              <span className="mark mark--sage">Ингредиенты</span>
            </h2>

            {hasAmounts && (
              <div className="portions" style={{ marginBottom: 14 }}>
                <span className="portions__label">Порции</span>
                {[0.5, 1, 2].map((m) => (
                  <button
                    key={m}
                    onClick={() => setPortionMultiplier(m)}
                    className={`portions__btn ${portionMultiplier === m ? 'portions__btn--on' : ''}`}
                  >
                    ×{m}
                  </button>
                ))}
              </div>
            )}

            <ul className="ing-list">
              {recipe.ingredients.map((ing, idx) => {
                const isChecked = !!checkedIngredients[idx];
                const calculatedAmount = ing.amount
                  ? Math.round(ing.amount * portionMultiplier * 100) / 100
                  : null;

                return (
                  <li key={idx}>
                    <button
                      onClick={() => toggleIngredientCheck(idx)}
                      className={`ing-item ${isChecked ? 'ing-item--on' : ''}`}
                    >
                      <span className={`ing-box ${isChecked ? 'ing-box--on' : ''}`} />
                      <span className="ing-name">
                        {ing.name}
                        {ing.note && <span className="ing-note"> ({ing.note})</span>}
                      </span>
                      <span className="ing-lead" />
                      {calculatedAmount && (
                        <span className="ing-qty">
                          {calculatedAmount} {ing.unit || ''}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* About the collection */}
            <div className="note-card" style={{ marginTop: 26 }}>
              <div className="note-card__label">
                <DecorativeDoodle type="lemon" size={18} />
                <span>О коллекции</span>
              </div>
              <p className="note-card__text" style={{ fontSize: 14.5 }}>
                Все рецепты собраны из семейного архива (15 оригинальных сканов). Сохранен
                оригинальный текст и язык (RU / UK / FR).
              </p>
            </div>

            <div className="no-print only-wide" style={{ marginTop: 22 }}>
              <AdPlaceholder type="recipe_sidebar" />
            </div>
          </aside>

          {/* Directions */}
          <section>
            <h2 className="block-title">
              <span className="mark">Приготовление</span>
            </h2>

            <ol className="steps">
              {recipe.directions.map((step, idx) => (
                <li key={idx} className="step">
                  <span className="step__num">{idx + 1}</span>
                  <p className="step__text">{step}</p>
                </li>
              ))}
            </ol>

            {/* Photos of the original clipping, when we have them */}
            {recipe.scans?.map((src, i) => (
              <figure className="scan-figure" key={src}>
                <img src={src} alt={`Оригинал: ${recipe.title}`} loading="lazy" />
                <figcaption>
                  оригинал вырезки
                  {recipe.scans!.length > 1 ? ` — ${i + 1} из ${recipe.scans!.length}` : ''}
                </figcaption>
              </figure>
            ))}

            <div style={{ marginTop: 36 }}>
              <AdPlaceholder type="recipe_in_content" />
            </div>
          </section>
        </div>
      </article>

      <div className="no-print" style={{ marginTop: 48 }}>
        <AdPlaceholder type="recipe_below" />
      </div>

      {/* Related recipes */}
      {relatedRecipes.length > 0 && (
        <section className="no-print" style={{ marginTop: 56 }}>
          <div className="section-head">
            <h2 className="section-title section-title--sm">
              Ещё из категории «{recipe.categoryName}»
            </h2>
            <button onClick={() => onNavigate('category', recipe.category)} className="section-link">
              Вся категория →
            </button>
          </div>
          <div className="grid-2">
            {relatedRecipes.map((rel) => (
              <RecipeCard
                key={rel.id}
                recipe={rel}
                onSelect={(slug) => onNavigate('recipe', slug)}
                onToggleLike={onToggleLike}
                onToggleFavorite={onToggleFavorite}
                isLiked={likedRecipeIds.includes(rel.id)}
                isFavorite={favoriteRecipeIds.includes(rel.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Kitchen Cooking Mode Modal */}
      {isCookingModeOpen && (
        <CookingModeModal recipe={recipe} onClose={() => setIsCookingModeOpen(false)} />
      )}
    </div>
  );
};
