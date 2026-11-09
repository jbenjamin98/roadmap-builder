export default function DuckDecoy() {
  return (
    <svg viewBox="0 0 36 32" className="w-7 h-7" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="decoyBodyG" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="55%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#78350f" />
        </radialGradient>
        <linearGradient id="decoyWingG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
        <linearGradient id="decoyBeakG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#92400e" />
          <stop offset="100%" stopColor="#451a03" />
        </linearGradient>
      </defs>
      {/* Carved Oak Duck Body */}
      <path
        d="M5 20 C4 15, 9 13, 16 14 C20 14.5, 24 13, 25 10 C26 14, 28 20, 24 24.5 C20 28, 10 28, 6.5 24 C5.5 23, 5 21, 5 20 Z"
        fill="url(#decoyBodyG)"
        stroke="#451a03"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Specular Polished Wood Back Highlight */}
      <path
        d="M8 15.5 Q14 14.5 19 15.5"
        stroke="rgba(254,243,199,0.55)"
        strokeWidth="1"
        strokeLinecap="round"
      />
      {/* Wood Grain Lines on Body */}
      <path
        d="M8 21 Q15 19 22 21 M10 24 Q16 23 21 24"
        stroke="#451a03"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.65"
      />
      {/* Carved Wing */}
      <path
        d="M10 17.5 C14 16, 19 17, 19 20.5 C19 22.5, 14 23.5, 10 21.5 Z"
        fill="url(#decoyWingG)"
        stroke="#451a03"
        strokeWidth="1.3"
      />
      {/* Carved Wooden Head */}
      <circle
        cx="23"
        cy="10.5"
        r="5.2"
        fill="url(#decoyBodyG)"
        stroke="#451a03"
        strokeWidth="1.6"
      />
      {/* Head Crown Specular Shine */}
      <path
        d="M20.5 7.2 Q23 6 25.5 7.2"
        stroke="rgba(254,243,199,0.65)"
        strokeWidth="1"
        strokeLinecap="round"
      />
      {/* Dark Walnut Beak */}
      <path
        d="M27.5 9.5 C31 9.5, 33 11, 31.5 12.5 C30 13.5, 27.5 13, 27.5 13 Z"
        fill="url(#decoyBeakG)"
        stroke="#451a03"
        strokeWidth="1.3"
      />
      {/* Gleaming Brass Pin Eye */}
      <circle cx="24.5" cy="9.5" r="1.3" fill="#fde047" stroke="#451a03" strokeWidth="0.7" />
      <circle cx="24.2" cy="9.2" r="0.45" fill="#ffffff" />
    </svg>
  );
}
