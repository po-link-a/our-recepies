import React from 'react';

export type AdSlotType =
  | 'hero_below'
  | 'section_between'
  | 'in_grid'
  | 'recipe_sidebar'
  | 'recipe_in_content'
  | 'recipe_below'
  | 'footer';

interface AdPlaceholderProps {
  type: AdSlotType;
  className?: string;
}

export const AdPlaceholder: React.FC<AdPlaceholderProps> = ({ type, className = '' }) => {
  let sizeLabel = '728 × 90';
  let height = '90px';
  let maxWidth = '728px';
  let isSticky = false;

  switch (type) {
    case 'hero_below':
      sizeLabel = '728 × 90 (Leaderboard) / 320 × 100 (Mobile)';
      height = '90px';
      maxWidth = '728px';
      break;
    case 'section_between':
      sizeLabel = '336 × 280 (Large Rectangle)';
      height = '280px';
      maxWidth = '336px';
      break;
    case 'in_grid':
      sizeLabel = '300 × 250 (Medium Rectangle)';
      height = '250px';
      maxWidth = '300px';
      break;
    case 'recipe_sidebar':
      sizeLabel = '300 × 600 (Half Page Sticky)';
      height = '600px';
      maxWidth = '300px';
      isSticky = true;
      break;
    case 'recipe_in_content':
      sizeLabel = '336 × 280 (In-Article Ad)';
      height = '280px';
      maxWidth = '336px';
      break;
    case 'recipe_below':
      sizeLabel = '728 × 90 (Leaderboard)';
      height = '90px';
      maxWidth = '728px';
      break;
    case 'footer':
      sizeLabel = '970 × 90 (Large Leaderboard) / 320 × 50';
      height = '90px';
      maxWidth = '970px';
      break;
  }

  return (
    <div
      className={`ad-slot no-print ${isSticky ? 'ad-slot--sticky' : ''} ${className}`}
      style={{ minHeight: height, maxWidth }}
      aria-label="Рекламный блок"
    >
      <div className="ad-slot__row">
        <span className="ad-badge">Реклама</span>
        <span className="ad-size">{sizeLabel}</span>
      </div>
      <p className="ad-hint">Google AdSense Reserved Banner Space</p>
    </div>
  );
};
