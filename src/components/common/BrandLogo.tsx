import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showText = true
}) => {
  const sizeMap = {
    sm: 'w-9 h-9',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Official Circular Badge Vector */}
      <svg
        viewBox="0 0 300 300"
        className={`${sizeMap[size]} shrink-0 transition-transform duration-200`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Circular Rings */}
        <circle cx="150" cy="150" r="144" stroke="#166534" strokeWidth="5.5" />
        <circle cx="150" cy="150" r="137" stroke="#166534" strokeWidth="2.5" />

        {/* Roof Structure */}
        <path
          d="M 65 92 L 150 28 L 235 92"
          stroke="#166534"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Chimney */}
        <rect x="195" y="44" width="14" height="26" fill="#166534" rx="2" />
        {/* Chimney Leaves */}
        <path
          d="M 202 44 C 196 34 186 36 186 36 C 186 36 198 40 202 44 Z"
          fill="#166534"
        />
        <path
          d="M 204 42 C 214 32 224 35 224 35 C 224 35 210 39 204 42 Z"
          fill="#166534"
        />

        {/* Roof Window (4 small squares) */}
        <rect x="141" y="52" width="7" height="7" fill="#166534" rx="1" />
        <rect x="152" y="52" width="7" height="7" fill="#166534" rx="1" />
        <rect x="141" y="63" width="7" height="7" fill="#166534" rx="1" />
        <rect x="152" y="63" width="7" height="7" fill="#166534" rx="1" />

        {/* Side Decorative Sprout Leaves */}
        <path
          d="M 52 110 C 44 125 54 148 64 160 C 65 142 62 124 52 110 Z"
          fill="#166534"
        />
        <path
          d="M 66 122 C 60 134 68 150 76 160 C 76 146 74 133 66 122 Z"
          fill="#166534"
        />

        {/* Main Bengali Title: ঘরের স্বাদ */}
        <text
          x="150"
          y="126"
          textAnchor="middle"
          fontSize="48"
          fontWeight="bold"
          fontFamily="'Hind Siliguri', 'Noto Sans Bengali', system-ui"
          fill="#166534"
          letterSpacing="0.5"
        >
          ঘরের
        </text>
        <text
          x="150"
          y="166"
          textAnchor="middle"
          fontSize="50"
          fontWeight="bold"
          fontFamily="'Hind Siliguri', 'Noto Sans Bengali', system-ui"
          fill="#166534"
          letterSpacing="0.5"
        >
          স্বাদ
        </text>

        {/* Banner with Tagline: সব স্বাদের এক ঠিকানা */}
        <path
          d="M 70 198 Q 150 206 230 198 L 224 216 Q 150 224 76 216 Z"
          fill="#166534"
        />
        <text
          x="150"
          y="213"
          textAnchor="middle"
          fontSize="13"
          fontWeight="bold"
          fontFamily="'Hind Siliguri', 'Noto Sans Bengali', system-ui"
          fill="#FFFFFF"
        >
          সব স্বাদের এক ঠিকানা
        </text>

        {/* Sub-Tagline: ঘরোয়া স্বাদ, ভালোবাসায় ভরা */}
        <text
          x="150"
          y="233"
          textAnchor="middle"
          fontSize="11.5"
          fontWeight="600"
          fontFamily="'Hind Siliguri', 'Noto Sans Bengali', system-ui"
          fill="#166534"
        >
          ঘরোয়া স্বাদ, ভালোবাসায় ভরা
        </text>

        {/* Divider line */}
        <line x1="60" y1="241" x2="240" y2="241" stroke="#166534" strokeWidth="1" />

        {/* Service list line */}
        <text
          x="150"
          y="253"
          textAnchor="middle"
          fontSize="8.5"
          fontWeight="500"
          fontFamily="'Hind Siliguri', 'Noto Sans Bengali', system-ui"
          fill="#166534"
        >
          বাংলা খাবার | ফাস্ট ফুড | সী ফুড | ডালা | মিল | ক্যাটারিং
        </text>

        {/* Contact Numbers in Emblem */}
        <g transform="translate(100, 261)">
          {/* Phone icon */}
          <circle cx="6" cy="6" r="6" fill="#166534" />
          <path d="M4 4 C4 7 5 8 8 8" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
          <text x="17" y="9.5" fontSize="9.5" fontWeight="bold" fontFamily="monospace" fill="#166534">
            01857220603
          </text>
        </g>
        <g transform="translate(98, 277)">
          {/* WhatsApp icon */}
          <circle cx="6" cy="6" r="6" fill="#166534" />
          <path d="M4 6.5 A2.5 2.5 0 0 1 7 4 A2.5 2.5 0 0 1 8 7 L4 6.5 Z" fill="#FFFFFF" />
          <text x="17" y="9.5" fontSize="9" fontWeight="bold" fontFamily="monospace" fill="#166534">
            +8801912838891
          </text>
        </g>
      </svg>

      {/* Optional Brand Name Text Beside Logo */}
      {showText && (
        <div className="leading-tight">
          <span className="block text-xl font-bold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
            ঘরের স্বাদ
          </span>
          <span className="block text-[11px] font-semibold text-emerald-800 tracking-wide">
            সব স্বাদের এক ঠিকানা
          </span>
        </div>
      )}
    </div>
  );
};
