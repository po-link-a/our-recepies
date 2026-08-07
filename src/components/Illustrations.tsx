import React from 'react';

/* Shared monoline stroke settings — flat, no fills, single hairline weight. */
const line = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/* Brand mark used in the header / footer */
export const BookMark: React.FC<{ size?: number; className?: string }> = ({
  size = 26,
  className = 'brand__mark',
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...line} strokeWidth={1.4}>
    <path d="M12 20C12 20 3.5 14.6 3.5 8.9C3.5 6.2 5.6 4.4 7.9 4.4C9.6 4.4 11.2 5.4 12 7C12.8 5.4 14.4 4.4 16.1 4.4C18.4 4.4 20.5 6.2 20.5 8.9C20.5 14.6 12 20 12 20Z" />
  </svg>
);

/* Hero: cooking pot with the lid flying off and ingredients tumbling in */
export const HeroPotIllustration: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 320 300"
    className={className}
    style={{ width: '100%', height: 'auto', display: 'block', color: '#D93A2B' }}
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Pot */}
    <path d="M68 158h184v66a26 26 0 0 1-26 26H94a26 26 0 0 1-26-26z" />
    <path d="M68 176H48a15 15 0 0 1 0-30h20M252 176h20a15 15 0 0 0 0-30h-20" />
    <path d="M80 190c20 8 44 8 64 0" strokeDasharray="2 6" opacity="0.7" />
    <path d="M56 148h208" />

    {/* Lid, tilted, lifting off */}
    <g transform="rotate(-10 160 118)">
      <path d="M96 118c0-12 28-20 64-20s64 8 64 20z" />
      <path d="M92 118h136" />
      <path d="M154 94a7 7 0 0 1 12 0" />
    </g>

    {/* Steam */}
    <path d="M140 78c-4-8 4-12 0-20M180 74c4-8-4-12 0-20" opacity="0.65" />

    {/* Carrot */}
    <g transform="rotate(28 96 58)">
      <path d="M88 44l16 4-28 34a3 3 0 0 1-4-4z" />
      <path d="M92 40l4-10M100 42l8-8M104 48l10-2" />
      <path d="M84 58l8 2M78 66l8 2" strokeWidth="1.6" />
    </g>

    {/* Onion */}
    <path d="M210 42c-11 5-17 13-17 21a17 17 0 0 0 34 0c0-8-6-16-17-21z" />
    <path d="M210 42c-4 6-6 14-6 21a25 25 0 0 0 6 17M210 42c4 6 6 14 6 21a25 25 0 0 1-6 17M210 42v-10M204 36l2-6M216 36l-2-6" />

    {/* Lemon half */}
    <g transform="rotate(-14 268 76)">
      <path d="M250 76a18 18 0 0 1 36 0z" />
      <path d="M268 76v-14M259 76l-5-11M277 76l5-11" strokeWidth="1.6" />
      <path d="M246 76h44" />
    </g>

    {/* Mushroom */}
    <g transform="rotate(12 150 30)">
      <path d="M136 30c0-9 7-15 14-15s14 6 14 15z" />
      <path d="M144 30l-2 12a8 8 0 0 0 16 0l-2-12" />
      <circle cx="146" cy="23" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="155" cy="25" r="1.4" fill="currentColor" stroke="none" />
    </g>

    {/* Bay leaf sprig */}
    <g transform="rotate(-30 52 100)">
      <path d="M44 118c8-14 8-26 8-34" />
      <path d="M52 96c-8-2-12-8-12-14 8 0 12 4 12 14zM52 106c8-2 12-8 12-14-8 0-12 4-12 14z" strokeWidth="1.6" />
    </g>

    {/* Heart + star */}
    <path d="M282 118c3-5 9-5 11 0-2 6-9 7-11 0z" strokeWidth="1.6" />
    <path d="M36 132l2 5 5 1-4 4 1 5-4-3-5 3 1-5-4-4 5-1z" strokeWidth="1.4" />

    {/* Peppercorns falling in */}
    <circle cx="120" cy="136" r="2" fill="currentColor" stroke="none" />
    <circle cx="196" cy="130" r="2" fill="currentColor" stroke="none" />
    <circle cx="162" cy="140" r="2" fill="currentColor" stroke="none" />
  </svg>
);

/* 10 category monoline icons */
export const CategoryIcon: React.FC<{ name: string; className?: string; size?: number }> = ({
  name,
  className = '',
  size = 32,
}) => {
  const svg = (children: React.ReactNode) => (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} {...line}>
      {children}
    </svg>
  );

  switch (name) {
    case 'waffle':
      return svg(
        <>
          <rect x="9" y="9" width="30" height="30" rx="4" />
          <path d="M19 9v30M29 9v30M9 19h30M9 29h30" />
        </>
      );
    case 'pancake':
      return svg(
        <>
          <ellipse cx="24" cy="35" rx="16" ry="5" />
          <ellipse cx="24" cy="28" rx="14" ry="4.5" />
          <ellipse cx="24" cy="21" rx="12" ry="4" />
          <path d="M20 14h8v4h-8z" />
          <path d="M24 14v-3" />
        </>
      );
    case 'pirozhok':
      return svg(
        <>
          <path d="M9 31c5-15 25-15 30 0z" />
          <path d="M7 31h34" />
          <path d="M16 25c1-3 4-4 6-3M27 21c2-1 5 1 6 4" strokeWidth={1.3} />
        </>
      );
    case 'rollingpin':
      return svg(
        <>
          <rect x="13" y="18" width="22" height="12" rx="6" />
          <path d="M13 24H6M35 24h7" />
          <path d="M19 18v12M29 18v12" strokeWidth={1.3} opacity="0.7" />
        </>
      );
    case 'cake':
      return svg(
        <>
          <path d="M11 22h26v14a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3z" />
          <path d="M11 27c4 3 8 3 13 0s9-3 13 0" strokeWidth={1.3} />
          <path d="M24 22v-6" />
          <circle cx="24" cy="13" r="3" />
        </>
      );
    case 'salad':
      return svg(
        <>
          <path d="M9 23c2 12 28 12 30 0z" />
          <path d="M7 23h34" />
          <path d="M17 17c0-4 4-6 7-4M26 15c3-2 6 0 6 4" strokeWidth={1.3} />
        </>
      );
    case 'soup':
      return svg(
        <>
          <path d="M11 21h26v13a5 5 0 0 1-5 5H16a5 5 0 0 1-5-5z" />
          <path d="M9 21h30" />
          <path d="M11 25h-4M37 25h4" strokeWidth={1.3} />
          <path d="M20 15c-2-3 2-5 0-8M28 15c2-3-2-5 0-8" strokeWidth={1.3} opacity="0.7" />
        </>
      );
    case 'meat':
      return svg(
        <>
          <path d="M15 20c0-7 18-7 18 0 0 11-18 11-18 0z" />
          <path d="M33 20l6-5" />
          <circle cx="24" cy="21" r="3.5" strokeWidth={1.3} />
        </>
      );
    case 'fish':
      return svg(
        <>
          <path d="M10 24c14-12 28-12 32 0-4 12-18 12-32 0z" />
          <path d="M10 24L3 17l2 7-2 7z" />
          <circle cx="34" cy="21" r="1.6" fill="currentColor" stroke="none" />
          <path d="M24 17c-3 5-3 9 0 14" strokeWidth={1.3} opacity="0.7" />
        </>
      );
    case 'casserole':
      return svg(
        <>
          <path d="M10 21h28v13a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4z" />
          <path d="M10 25H6M38 25h4" strokeWidth={1.3} />
          <path d="M14 15h20l-2 6H16z" />
          <path d="M24 15v-4" />
        </>
      );
    default:
      return svg(<circle cx="24" cy="24" r="15" />);
  }
};

/* Situational tag micro icons */
export const TagMicroIcon: React.FC<{ name: string; className?: string; size?: number }> = ({
  name,
  className = '',
  size = 14,
}) => {
  const svg = (children: React.ReactNode) => (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...line} strokeWidth={1.7}>
      {children}
    </svg>
  );

  switch (name) {
    case 'quick':
      return svg(
        <>
          <circle cx="12" cy="13" r="8" />
          <path d="M12 9v4l3 2" />
          <path d="M10 2h4" />
        </>
      );
    case 'pantry':
      return svg(
        <>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M4 12h16M10 7v1M10 16v1" />
        </>
      );
    case 'guests':
      return svg(
        <>
          <path d="M8 22v-7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v7" />
          <path d="M7 10a5 5 0 0 0 10 0" />
          <path d="M12 2v4" />
        </>
      );
    case 'kids':
      return svg(
        <>
          <path d="M12 2a5 5 0 0 0-5 5v3a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5z" />
          <path d="M7 13a6 6 0 0 0 10 0" />
          <circle cx="9.5" cy="7" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="14.5" cy="7" r="0.9" fill="currentColor" stroke="none" />
        </>
      );
    case 'archive':
      return svg(
        <>
          <path d="M5 4l14-2v20L5 22z" />
          <path d="M8 8h8M8 12h8M8 16h5" strokeDasharray="2 3" />
        </>
      );
    default:
      return null;
  }
};

/* Small decorative line-art elements */
export const DecorativeDoodle: React.FC<{
  type: 'lemon' | 'strawberry' | 'whisk' | 'baguette' | 'heart' | 'stars';
  className?: string;
  size?: number;
}> = ({ type, className = '', size = 24 }) => {
  const svg = (children: React.ReactNode) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      style={{ color: '#D93A2B' }}
      {...line}
    >
      {children}
    </svg>
  );

  switch (type) {
    case 'lemon':
      return svg(
        <>
          <path d="M6 18a10 10 0 0 1 20 0z" />
          <path d="M4 18h24" />
          <path d="M16 18v-8M11 18l-3-6M21 18l3-6" strokeWidth={1.3} />
        </>
      );
    case 'strawberry':
      return svg(
        <>
          <path d="M16 28c-6-5-9-11-7-15 4-3 10-3 14 0 2 4-1 10-7 15z" />
          <path d="M12 9a5 5 0 0 1 8 0" />
          <path d="M16 9V5" />
        </>
      );
    case 'whisk':
      return svg(
        <>
          <path d="M9 9c-2 6 7 13 7 13s9-7 7-13c-2-6-12-6-14 0z" />
          <path d="M16 6v16" strokeWidth={1.3} />
          <path d="M16 22v8" strokeWidth={2.2} />
        </>
      );
    case 'baguette':
      return svg(
        <>
          <rect x="4" y="12" width="24" height="8" rx="4" transform="rotate(-25 16 16)" />
          <path d="M11 13l3 5M16 10l3 5M21 7l3 5" strokeWidth={1.3} />
        </>
      );
    case 'heart':
      return svg(
        <path d="M16 27C16 27 4 19 4 11.5A5.5 5.5 0 0 1 16 8a5.5 5.5 0 0 1 12 3.5C28 19 16 27 16 27z" />
      );
    case 'stars':
      return svg(
        <>
          <path d="M16 5l2.5 7.5L26 15l-7.5 2.5L16 25l-2.5-7.5L6 15l7.5-2.5z" />
        </>
      );
    default:
      return null;
  }
};
