export default function SkyClouds() {
  return (
    <svg
      viewBox="0 0 1440 160"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full"
    >
      <defs>
        <linearGradient id="cloudGradGuard" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.96" />
          <stop offset="70%" stopColor="#f0f9ff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.78" />
        </linearGradient>
      </defs>

      {/* Light Mode Fluffy Storybook Vector Clouds */}
      <g className="dark:hidden">
        <g transform="translate(170, 26)">
          <path
            d="M24,46 L126,46 C140,46 148,36 144,25 C140,15 128,14 122,17 C116,4 98,-2 82,4 C68,-4 46,2 40,16 C26,14 12,24 14,36 C15,42 19,46 24,46 Z"
            fill="url(#cloudGradGuard)"
            stroke="#e0f2fe"
            strokeWidth="1.5"
          />
          <path
            d="M42,18 C52,8 72,6 84,12"
            stroke="#ffffff"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
        </g>
        <g transform="translate(880, 32) scale(0.9)">
          <path
            d="M24,46 L136,46 C150,46 158,36 154,25 C150,15 138,14 132,17 C126,4 108,-2 92,4 C78,-4 56,2 50,16 C36,14 18,24 20,36 C21,42 22,46 24,46 Z"
            fill="url(#cloudGradGuard)"
            stroke="#e0f2fe"
            strokeWidth="1.5"
          />
        </g>
      </g>

      {/* Dark Mode Twinkling 4-Point Vector Stars */}
      <g className="hidden dark:block">
        <path
          d="M210,22 L213,30 L221,33 L213,36 L210,44 L207,36 L199,33 L207,30 Z"
          fill="#fef08a"
          opacity="0.9"
        />
        <path
          d="M520,38 L522,44 L528,46 L522,48 L520,54 L518,48 L512,46 L518,44 Z"
          fill="#e2e8f0"
          opacity="0.8"
        />
        <path
          d="M940,24 L943,31 L950,34 L943,37 L940,44 L937,37 L930,34 L937,31 Z"
          fill="#fef08a"
          opacity="0.85"
        />
        <path
          d="M1210,42 L1212,47 L1217,49 L1212,51 L1210,56 L1208,51 L1203,49 L1208,47 Z"
          fill="#bae6fd"
          opacity="0.85"
        />
        <circle cx="360" cy="28" r="1.8" fill="#fef9c3" opacity="0.75" />
        <circle cx="740" cy="24" r="2" fill="#e0f2fe" opacity="0.7" />
        <circle cx="1090" cy="30" r="1.6" fill="#fef08a" opacity="0.75" />
      </g>
    </svg>
  );
}
