import React from 'react';
import { ContainerType } from '../types';

interface IconProps {
  className?: string;
  size?: number;
}

/**
 * 250ml Standard Cup / Glass Symbol
 * Sleek drinking glass / tumbler with fresh water level, meniscus wave, and 250 ml mark
 */
export const Cup250Icon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="250ml Glass"
  >
    {/* Glass Rim Ellipse */}
    <ellipse cx="24" cy="9.5" rx="13.5" ry="3.5" className="stroke-current" strokeWidth="2.5" />

    {/* Tapered Glass Body */}
    <path
      d="M10.8 9.5L15 38.5C15.3 40.5 17 42 19 42H29C31 42 32.7 40.5 33 38.5L37.2 9.5"
      className="stroke-current"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Water Fill */}
    <path
      d="M13 19.5C16.5 21.2 20.5 21.2 24 20C27.5 18.8 31.5 19 35 20.5L33.3 38C33.1 39.5 31.8 40.5 30.3 40.5H17.7C16.2 40.5 14.9 39.5 14.7 38L13 19.5Z"
      fill="currentColor"
      fillOpacity="0.22"
    />

    {/* Surface Meniscus */}
    <path
      d="M13 19.5C16.5 21.2 20.5 21.2 24 20C27.5 18.8 31.5 19 35 20.5"
      className="stroke-current"
      strokeWidth="2"
      strokeLinecap="round"
      strokeOpacity="0.9"
    />

    {/* Measurement graduations */}
    <line x1="14.5" y1="25" x2="17.5" y2="25" className="stroke-current" strokeWidth="1.75" strokeLinecap="round" strokeOpacity="0.7" />
    <line x1="15" y1="30" x2="18" y2="30" className="stroke-current" strokeWidth="1.75" strokeLinecap="round" strokeOpacity="0.5" />

    {/* 250 ML typography */}
    <text
      x="24"
      y="31"
      textAnchor="middle"
      fill="currentColor"
      fontSize="8.5"
      fontWeight="900"
      fontFamily="system-ui, -apple-system, sans-serif"
      letterSpacing="-0.3px"
      fillOpacity="0.95"
    >
      250
    </text>
    <text
      x="24"
      y="37.5"
      textAnchor="middle"
      fill="currentColor"
      fontSize="5.5"
      fontWeight="800"
      fontFamily="system-ui, -apple-system, sans-serif"
      letterSpacing="0.2px"
      fillOpacity="0.8"
    >
      ML
    </text>
  </svg>
);

/**
 * 500ml Everyday Water Bottle Symbol
 * Sleek stainless steel / reusable hydration bottle.
 * Flat knurled metal screw cap, clean straight cylindrical body (no pinched waist, no nipple spout),
 * screw thread collar, and 500 ML badge.
 */
export const Bottle500Icon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="500ml Water Bottle"
  >
    {/* Flat Insulated Metal Screw Cap (Modern Reusable Bottle Style) */}
    <rect
      x="18"
      y="5"
      width="12"
      height="7"
      rx="2"
      className="stroke-current"
      strokeWidth="2.5"
      fill="currentColor"
      fillOpacity="0.2"
    />

    {/* Cap Grip Knurl Lines */}
    <line x1="21.5" y1="6.5" x2="21.5" y2="10.5" className="stroke-current" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7" />
    <line x1="24" y1="6.5" x2="24" y2="10.5" className="stroke-current" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7" />
    <line x1="26.5" y1="6.5" x2="26.5" y2="10.5" className="stroke-current" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7" />

    {/* Screw Thread / Neck Ring */}
    <path d="M17.5 13H30.5" className="stroke-current" strokeWidth="2.5" strokeLinecap="round" />

    {/* Straight Modern Bottle Silhouette (Clean Cylindrical Metal Bottle) */}
    <path
      d="M19 13L16.5 17C16 17.8 15.5 18.8 15.5 20V39.5C15.5 41.5 17.2 43 19.5 43H28.5C30.8 43 32.5 41.5 32.5 39.5V20C32.5 18.8 32 17.8 31.5 17L29 13"
      className="stroke-current"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Water Fill Silhouette */}
    <path
      d="M16 23C19 24.5 22 24.5 24 23.5C26 22.5 29 22.5 32 23.8V39.5C32 41 30.5 42 29 42H19C17.5 42 16 41 16 39.5V23Z"
      fill="currentColor"
      fillOpacity="0.22"
    />

    {/* Meniscus Wave */}
    <path
      d="M16 23C19 24.5 22 24.5 24 23.5C26 22.5 29 22.5 32 23.8"
      className="stroke-current"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeOpacity="0.9"
    />

    {/* 500 ML Typography */}
    <text
      x="24"
      y="32.5"
      textAnchor="middle"
      fill="currentColor"
      fontSize="8.5"
      fontWeight="900"
      fontFamily="system-ui, -apple-system, sans-serif"
      letterSpacing="-0.3px"
      fillOpacity="0.95"
    >
      500
    </text>
    <text
      x="24"
      y="38.5"
      textAnchor="middle"
      fill="currentColor"
      fontSize="5.5"
      fontWeight="800"
      fontFamily="system-ui, -apple-system, sans-serif"
      letterSpacing="0.2px"
      fillOpacity="0.8"
    >
      ML
    </text>
  </svg>
);

/**
 * 750ml Large Sports Bottle / Gym Hydration Jug Symbol
 * High-capacity wide-mouth fitness bottle featuring a rugged sports cap with side carabiner/finger carry loop,
 * wide straight insulated body, stainless-steel base, and bold 750 ML badge.
 */
export const LargeBottle750Icon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="750ml Large Sports Bottle"
  >
    {/* Rugged Sports Cap with Integrated Right-Side Carry Loop (Classic Gym / Trail Bottle) */}
    {/* Side Finger Loop */}
    <path
      d="M30 7H34C36.2 7 38 8.8 38 11C38 13.2 36.2 15 34 15H30"
      className="stroke-current"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Wide Sturdy Cap */}
    <rect
      x="15"
      y="6"
      width="16"
      height="7"
      rx="2"
      className="stroke-current"
      strokeWidth="2.5"
      fill="currentColor"
      fillOpacity="0.22"
    />

    {/* Cap Ridge */}
    <line x1="19" y1="7.5" x2="19" y2="11.5" className="stroke-current" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7" />
    <line x1="23" y1="7.5" x2="23" y2="11.5" className="stroke-current" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7" />
    <line x1="27" y1="7.5" x2="27" y2="11.5" className="stroke-current" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7" />

    {/* Wide Mouth Collar */}
    <path d="M14 14H32" className="stroke-current" strokeWidth="2.5" strokeLinecap="round" />

    {/* Sturdy Wide-Body Sports Cylinder (Straight rugged walls) */}
    <path
      d="M17 14L13.5 18C13 18.6 12.5 19.5 12.5 20.5V39.5C12.5 41.5 14.5 43 17 43H29C31.5 43 33.5 41.5 33.5 39.5V20.5C33.5 19.5 33 18.6 32.5 18L29 14"
      className="stroke-current"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Water Fill Silhouette */}
    <path
      d="M13 23.5C17 25 21 25 23 24C25 23 29 23 33 24.5V39.5C33 41 31.5 42 29.5 42H16.5C14.5 42 13 41 13 39.5V23.5Z"
      fill="currentColor"
      fillOpacity="0.22"
    />

    {/* Fresh Water Surface Meniscus Wave */}
    <path
      d="M13 23.5C17 25 21 25 23 24C25 23 29 23 33 24.5"
      className="stroke-current"
      strokeWidth="2"
      strokeLinecap="round"
      strokeOpacity="0.9"
    />

    {/* Base stainless reinforcement band */}
    <line x1="13.5" y1="38" x2="32.5" y2="38" className="stroke-current" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="3 2" />

    {/* 750 ML Bold Clear Typography */}
    <text
      x="23"
      y="32.5"
      textAnchor="middle"
      fill="currentColor"
      fontSize="9"
      fontWeight="900"
      fontFamily="system-ui, -apple-system, sans-serif"
      letterSpacing="-0.4px"
      fillOpacity="0.95"
    >
      750
    </text>
    <text
      x="23"
      y="37.5"
      textAnchor="middle"
      fill="currentColor"
      fontSize="5.5"
      fontWeight="800"
      fontFamily="system-ui, -apple-system, sans-serif"
      letterSpacing="0.2px"
      fillOpacity="0.8"
    >
      ML
    </text>
  </svg>
);

/**
 * Custom / Extra Drink Container Symbol
 * Clean drink tumbler with straw
 */
export const CustomGlassIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Custom Drink"
  >
    {/* Straw */}
    <path
      d="M28 5L33 2M28 5L22.5 26"
      className="stroke-current"
      strokeWidth="2.5"
      strokeLinecap="round"
    />

    {/* Lid */}
    <path d="M12 11H36" className="stroke-current" strokeWidth="2.5" strokeLinecap="round" />

    {/* Cup Body */}
    <path
      d="M13 11L16.2 38.5C16.5 40.5 18.2 42 20.3 42H27.7C29.8 42 31.5 40.5 31.8 38.5L35 11"
      className="stroke-current"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Liquid Fill */}
    <path
      d="M14.5 21C18 22.5 21.5 22.5 24 21C26.5 19.5 30 19.5 33.5 21L32.2 38C32.1 39.5 30.8 40.5 29.3 40.5H18.7C17.2 40.5 15.9 39.5 15.8 38L14.5 21Z"
      fill="currentColor"
      fillOpacity="0.22"
    />

    {/* Meniscus */}
    <path
      d="M14.5 21C18 22.8 21.5 22.8 24 21.2C26.5 19.6 30 19.6 33.5 21.2"
      className="stroke-current"
      strokeWidth="2"
      strokeLinecap="round"
    />

    {/* Plus badge */}
    <circle cx="36" cy="36" r="7" className="fill-m3-primary" />
    <path d="M36 32.5V39.5M32.5 36H39.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Alias for convenience
export const FlaskIcon = LargeBottle750Icon;

/**
 * Helper to render the appropriate SVG symbol based on container type
 */
export const ContainerSymbol: React.FC<{
  type: ContainerType | string;
  className?: string;
  size?: number;
}> = ({ type, className = 'w-6 h-6', size }) => {
  switch (type) {
    case 'cup':
      return <Cup250Icon className={className} size={size} />;
    case 'bottle':
      return <Bottle500Icon className={className} size={size} />;
    case 'large_bottle':
    case 'flask':
      return <LargeBottle750Icon className={className} size={size} />;
    default:
      return <CustomGlassIcon className={className} size={size} />;
  }
};
