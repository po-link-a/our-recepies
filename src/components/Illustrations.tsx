import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
  color?: string;
}

// Hero Composition: Big cooking pot with lid lifting off and ingredients tumbling in
export const HeroPotIllustration: React.FC<{ className?: string }> = ({ className = "w-full max-w-lg h-auto" }) => (
  <svg viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Decorative background circle */}
    <circle cx="300" cy="240" r="130" fill="#F7E7A9" opacity="0.4" />

    {/* Flying Ingredients */}
    {/* Bok Choy / Herbs */}
    <g transform="translate(180, 70) rotate(-20)" stroke="#D93A2B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d="M20,60 Q10,30 30,10 Q50,30 40,60" fill="#E2E9D8" />
      <path d="M10,70 Q-5,40 15,25 Q30,45 20,70" fill="#E2E9D8" />
      <path d="M30,70 Q45,40 30,20 Q15,40 25,70" />
      <path d="M20,60 L20,90 C20,95 25,95 25,90 L25,60" />
    </g>

    {/* Carrot */}
    <g transform="translate(270, 40) rotate(15)" stroke="#D93A2B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d="M15,15 L40,80 Q25,85 10,75 Z" fill="#F4CBB2" />
      <path d="M15,15 Q10,0 0,-5 M20,15 Q25,-5 30,-8 M25,15 Q35,5 45,0" />
      <path d="M18,35 Q25,37 20,40 M15,55 Q22,57 17,60" />
    </g>

    {/* Tomato */}
    <g transform="translate(370, 80) rotate(-10)" stroke="#D93A2B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
      <circle cx="30" cy="30" r="24" fill="#F8D7DA" />
      <path d="M25,8 Q30,2 35,8 Q40,15 30,12 Q20,15 25,8 Z" fill="#D93A2B" />
      <path d="M30,6 L30,0" />
      <path d="M20,25 Q25,20 35,28" strokeDasharray="2 3" />
    </g>

    {/* Fish */}
    <g transform="translate(130, 140) rotate(35)" stroke="#D93A2B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d="M10,25 Q35,0 70,25 Q35,50 10,25 Z" fill="#CFF4FC" />
      <path d="M10,25 L-10,10 L-5,25 L-10,40 Z" fill="#CFF4FC" />
      <circle cx="55" cy="20" r="3" fill="#D93A2B" />
      <path d="M40,12 Q30,25 40,38" />
    </g>

    {/* Flying Mushroom */}
    <g transform="translate(420, 150) rotate(-25)" stroke="#D93A2B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d="M10,25 Q10,0 35,0 Q60,0 60,25 Z" fill="#FFFDF7" />
      <path d="M25,25 L25,45 Q35,50 45,45 L45,25" />
    </g>

    {/* Lid lifting off */}
    <g transform="translate(230, 145) rotate(-12)" stroke="#D93A2B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d="M20,40 Q120,-10 220,40 Z" fill="#FFFDF7" />
      <ellipse cx="120" cy="8" rx="16" ry="8" fill="#D93A2B" />
      <path d="M120,8 L120,16" />
      {/* Steam lines */}
      <path d="M40,-10 Q30,-25 50,-40" strokeDasharray="3 3" />
      <path d="M120,-20 Q130,-35 110,-50" strokeDasharray="3 3" />
      <path d="M190,-10 Q200,-25 180,-40" strokeDasharray="3 3" />
    </g>

    {/* Main Cooking Pot */}
    <g transform="translate(180, 200)" stroke="#D93A2B" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
      {/* Handles */}
      <path d="M10,40 C-20,40 -20,80 10,80" fill="#FFFDF7" />
      <path d="M230,40 C260,40 260,80 230,80" fill="#FFFDF7" />

      {/* Pot body */}
      <path d="M10,20 L230,20 L215,140 C210,160 180,170 120,170 C60,170 30,160 25,140 Z" fill="#FFFDF7" />
      
      {/* Decorative band on pot */}
      <path d="M15,50 Q120,65 225,50" strokeWidth="2" strokeDasharray="4 4" />
      
      {/* Small cute heart on pot */}
      <path d="M115,90 Q120,83 125,90 Q130,97 120,105 Q110,97 115,90 Z" fill="#D93A2B" />
    </g>

    {/* Little stars & sparkles */}
    <g stroke="#D93A2B" strokeWidth="2" fill="none">
      <path d="M100,100 L100,110 M95,105 L105,105" />
      <path d="M490,90 L490,100 M485,95 L495,95" />
      <path d="M520,230 L520,240 M515,235 L525,235" />
      <circle cx="80" cy="220" r="3" fill="#D93A2B" />
      <circle cx="500" cy="180" r="4" fill="#D93A2B" />
    </g>
  </svg>
);

// 10 Category Monoline Icons
export const CategoryIcon: React.FC<{ name: string; className?: string; size?: number }> = ({ name, className = "w-8 h-8", size = 32 }) => {
  const strokeProps = {
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none"
  };

  switch (name) {
    case 'waffle':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
          <rect x="8" y="8" width="32" height="32" rx="6" {...strokeProps} fill="#FFFDF7" />
          <line x1="18" y1="8" x2="18" y2="40" {...strokeProps} />
          <line x1="30" y1="8" x2="30" y2="40" {...strokeProps} />
          <line x1="8" y1="18" x2="40" y2="18" {...strokeProps} />
          <line x1="8" y1="30" x2="40" y2="30" {...strokeProps} />
        </svg>
      );
    case 'pancake':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
          <ellipse cx="24" cy="36" rx="18" ry="6" {...strokeProps} fill="#FFFDF7" />
          <ellipse cx="24" cy="28" rx="18" ry="6" {...strokeProps} fill="#FFFDF7" />
          <ellipse cx="24" cy="20" rx="18" ry="6" {...strokeProps} fill="#FFFDF7" />
          {/* Butter melting */}
          <rect x="20" y="10" width="8" height="6" rx="1" fill="#F7E7A9" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case 'pirozhok':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
          <path d="M8,32 Q24,8 40,32 Q24,42 8,32 Z" {...strokeProps} fill="#FFFDF7" />
          <path d="M12,28 Q24,20 36,28" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
        </svg>
      );
    case 'rollingpin':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
          <rect x="12" y="18" width="24" height="12" rx="2" {...strokeProps} fill="#FFFDF7" />
          <path d="M6,24 L12,24 M36,24 L42,24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'cake':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
          <path d="M10,20 L38,20 L38,38 L10,38 Z" {...strokeProps} fill="#FFFDF7" />
          <path d="M10,20 Q24,10 38,20" {...strokeProps} />
          {/* Cherry & Heart */}
          <circle cx="24" cy="11" r="4" fill="#D93A2B" />
          <path d="M24,15 L24,20" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case 'salad':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
          <path d="M8,22 C8,36 40,36 40,22 Z" {...strokeProps} fill="#FFFDF7" />
          <path d="M14,16 Q20,10 24,18 Q30,10 34,16" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
      );
    case 'soup':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
          <path d="M10,20 L38,20 L35,38 C35,42 13,42 13,38 Z" {...strokeProps} fill="#FFFDF7" />
          <path d="M8,20 L40,20" stroke="currentColor" strokeWidth="2.5" />
          <path d="M20,14 Q18,8 22,4 M28,14 Q26,8 30,4" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
        </svg>
      );
    case 'meat':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
          <path d="M14,18 C14,10 34,10 34,18 C34,30 14,30 14,18 Z" {...strokeProps} fill="#FFFDF7" />
          <circle cx="24" cy="20" r="4" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case 'fish':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
          <path d="M8,24 Q24,10 40,24 Q24,38 8,24 Z" {...strokeProps} fill="#FFFDF7" />
          <path d="M8,24 L2,16 L4,24 L2,32 Z" {...strokeProps} />
          <circle cx="34" cy="20" r="2" fill="currentColor" />
        </svg>
      );
    case 'casserole':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
          <rect x="8" y="20" width="32" height="18" rx="4" {...strokeProps} fill="#FFFDF7" />
          <path d="M12,14 L36,14 L34,20 L14,20 Z" {...strokeProps} />
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
          <circle cx="24" cy="24" r="16" {...strokeProps} />
        </svg>
      );
  }
};

// Situational Tag Micro Icons
export const TagMicroIcon: React.FC<{ name: string; className?: string }> = ({ name, className = "w-4 h-4" }) => {
  switch (name) {
    case 'quick':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
          <circle cx="12" cy="13" r="8" />
          <polyline points="12 9 12 13 15 15" />
          <path d="M10 2h4" />
        </svg>
      );
    case 'pantry':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="10" y1="7" x2="10" y2="8" />
          <line x1="10" y1="16" x2="10" y2="17" />
        </svg>
      );
    case 'guests':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
          <path d="M8 22v-7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v7" />
          <path d="M7 10a4 4 0 1 0 10 0" />
          <line x1="12" y1="2" x2="12" y2="6" />
        </svg>
      );
    case 'kids':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
          <path d="M12 2a5 5 0 0 0-5 5v3a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5z" />
          <path d="M7 13a6 6 0 0 0 10 0" />
          <circle cx="9" cy="7" r="1" fill="currentColor" />
          <circle cx="15" cy="7" r="1" fill="currentColor" />
        </svg>
      );
    case 'archive':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
          <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2z" />
          <path d="M6 6h12" />
          <path d="M6 10h12" />
          <path d="M6 14h8" />
        </svg>
      );
    default:
      return null;
  }
};

// Decorative Line Art Elements
export const DecorativeDoodle: React.FC<{ type: 'lemon' | 'strawberry' | 'whisk' | 'baguette' | 'heart' | 'stars'; className?: string }> = ({ type, className = "w-6 h-6" }) => {
  const strokeProps = { stroke: "#D93A2B", strokeWidth: "2", strokeLinecap: "round" as const, fill: "none" };
  switch (type) {
    case 'lemon':
      return (
        <svg viewBox="0 0 32 32" className={className}>
          <ellipse cx="16" cy="16" rx="11" ry="8" transform="rotate(-30 16 16)" fill="#F7E7A9" stroke="#D93A2B" strokeWidth="2" />
          <path d="M6,22 Q3,25 2,23 M26,9 Q29,6 30,8" stroke="#D93A2B" strokeWidth="2" />
        </svg>
      );
    case 'strawberry':
      return (
        <svg viewBox="0 0 32 32" className={className}>
          <path d="M16,28 Q6,18 8,10 Q16,6 24,10 Q26,18 16,28 Z" fill="#F8D7DA" stroke="#D93A2B" strokeWidth="2" />
          <path d="M12,8 Q16,4 20,8" stroke="#D93A2B" strokeWidth="2" fill="#D93A2B" />
        </svg>
      );
    case 'whisk':
      return (
        <svg viewBox="0 0 32 32" className={className}>
          <path d="M8,8 C6,14 16,22 16,22 C16,22 26,14 24,8 C22,2 10,2 8,8 Z" {...strokeProps} />
          <line x1="16" y1="22" x2="16" y2="30" stroke="#D93A2B" strokeWidth="3" />
        </svg>
      );
    case 'baguette':
      return (
        <svg viewBox="0 0 32 32" className={className}>
          <rect x="4" y="12" width="24" height="8" rx="4" transform="rotate(-25 16 16)" fill="#F4CBB2" stroke="#D93A2B" strokeWidth="2" />
          <line x1="10" y1="12" x2="14" y2="18" stroke="#D93A2B" strokeWidth="1.5" />
          <line x1="16" y1="9" x2="20" y2="15" stroke="#D93A2B" strokeWidth="1.5" />
        </svg>
      );
    case 'heart':
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <path d="M12,21 Q3,13 3,7.5 A5,5 0 0,1 12,5 A5,5 0 0,1 21,7.5 Q21,13 12,21 Z" fill="#D93A2B" />
        </svg>
      );
    case 'stars':
      return (
        <svg viewBox="0 0 32 32" className={className}>
          <path d="M16,4 L18,12 L26,14 L18,16 L16,24 L14,16 L6,14 L14,12 Z" fill="#D93A2B" />
        </svg>
      );
    default:
      return null;
  }
};
