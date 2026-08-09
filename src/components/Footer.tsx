import React from 'react';
import { CATEGORIES, RECIPES } from '../data/recipes';
import { AdPlaceholder } from './AdPlaceholder';
import { BookMark } from './Illustrations';

interface FooterProps {
  onNavigate: (view: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        {/* Footer Ad Placement */}
        <AdPlaceholder type="footer" />

        <div className="footer__cols" style={{ marginTop: 40 }}>
          <div>
            <div className="footer__brand" onClick={() => onNavigate('home')}>
              <BookMark size={22} />
              <span className="brand__name">Семейные Рецепты</span>
            </div>
            <p className="footer__text">
              Оцифрованная коллекция из {RECIPES.length} домашних рецептов, собранных из газетных вырезок, старых
              кулинарных купонов и брошюр на русском, украинском и французском языках.
            </p>
          </div>

          {/* Category Sitemap */}
          <div>
            <h4 className="footer__title">Карта категорий</h4>
            <div className="footer__links">
              {Object.values(CATEGORIES).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onNavigate('category', cat.id)}
                  className="footer__link"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Languages & Meta info */}
          <div>
            <h4 className="footer__title">Языки архива</h4>
            <div className="row-wrap" style={{ marginBottom: 12 }}>
              <span className="lang-tag">RU</span>
              <span className="lang-tag">UK</span>
              <span className="lang-tag">FR</span>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <span className="footer__hand">Сделано с любовью и теплом</span>
          <span className="footer__meta">
            © {new Date().getFullYear()} Семейная Коллекция Рецептов — по материалам домашнего
            архива.
          </span>
        </div>
      </div>
    </footer>
  );
};
