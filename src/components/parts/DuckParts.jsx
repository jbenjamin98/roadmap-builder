export function YellowDuckIcon({ size = 20, className = '', wake = false }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 overflow-visible select-none ${className}`}
      aria-label="Yellow Duck"
    >
      <defs>
        <radialGradient id="ydBody" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="45%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#eab308" />
        </radialGradient>
        <radialGradient id="ydHead" cx="35%" cy="25%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
          <stop offset="35%" stopColor="#fef08a" />
          <stop offset="75%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#eab308" />
        </radialGradient>
        <linearGradient id="ydBeak" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>

      {/* Water wake ripple if enabled */}
      {wake && (
        <ellipse
          cx="16"
          cy="26"
          rx="14"
          ry="3.8"
          fill="rgba(56, 189, 248, 0.28)"
          stroke="rgba(255, 255, 255, 0.75)"
          strokeWidth="0.9"
        />
      )}

      {/* Duck Body & Upturned Tail */}
      <path
        d="M6 19 C5 14, 10 12, 16 13 C20 13.5, 24 12.5, 25 9 C26 13, 27 19, 23 23 C19 26, 10 26, 7 23 C6 22, 6 20, 6 19 Z"
        fill="url(#ydBody)"
        stroke="#ca8a04"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* Duck Wing Accent */}
      <path
        d="M10 19 C12 16, 17 16, 19 20 C16 22, 12 22, 10 19 Z"
        fill="#eab308"
        stroke="#ca8a04"
        strokeWidth="0.8"
      />

      {/* Head */}
      <circle cx="21" cy="8.5" r="5.5" fill="url(#ydHead)" stroke="#ca8a04" strokeWidth="1.2" />

      {/* Rosy Cheek */}
      <circle cx="22" cy="10.5" r="1.2" fill="#fb7185" opacity="0.6" />

      {/* Duck Eye with catchlight */}
      <circle cx="22" cy="7.5" r="1.1" fill="#0f172a" />
      <circle cx="21.7" cy="7.2" r="0.4" fill="#ffffff" />

      {/* Orange Beak */}
      <path
        d="M26 7.5 C29 7, 31 8.5, 29.5 10 C28.5 11, 25.5 10.5, 25.5 10.5 Z"
        fill="url(#ydBeak)"
        stroke="#c2410c"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DuckEggIcon({ size = 18, className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 select-none ${className}`}
      aria-label="Duck Egg"
    >
      <defs>
        <radialGradient id="deGrad" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor="#fef9c3" />
          <stop offset="75%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#facc15" />
        </radialGradient>
      </defs>
      {/* Egg Shape */}
      <path
        d="M12 2.5 C7.5 2.5, 4 8, 4 14 C4 18.5, 7.5 21.5, 12 21.5 C16.5 21.5, 20 18.5, 20 14 C20 8, 16.5 2.5, 12 2.5 Z"
        fill="url(#deGrad)"
        stroke="#ca8a04"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Gloss Specular Shine */}
      <path
        d="M8.5 7.5 C9 6, 11 5, 13 5"
        stroke="rgba(255, 255, 255, 0.9)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DuckFootprintIcon({ size = 14, className = '', color = '#f97316' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 select-none ${className}`}
      aria-label="Duck Footprint"
    >
      <path
        d="M12 20 L12 11 M12 11 L6 4 M12 11 L12 3 M12 11 L18 4"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 4 Q9 7 12 3 Q15 7 18 4"
        stroke={color}
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
