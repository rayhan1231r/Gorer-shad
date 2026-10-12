import React from 'react';
import logoImg from '../../assets/images/ghorer_shad_logo_1791731962583.jpg';

export interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'custom';
  className?: string;
  imgClassName?: string;
  alt?: string;
  withText?: boolean;
  textClassName?: string;
  taglineClassName?: string;
  language?: 'bn' | 'en';
  priority?: boolean;
  logoUrl?: string;
}

const sizeMap = {
  xs: 'w-7 h-7',
  sm: 'w-9 h-9',
  md: 'w-11 h-11',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
  '2xl': 'w-28 h-28',
  custom: ''
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  className = '',
  imgClassName = '',
  alt,
  withText = false,
  textClassName = '',
  taglineClassName = '',
  language = 'bn',
  logoUrl
}) => {
  const dimensionClass = size !== 'custom' ? sizeMap[size] : '';
  const defaultAlt = language === 'en' ? 'Ghorer Shad Logo' : 'ঘরের স্বাদ লোগো';

  const logoGraphic = (
    <div
      className={`relative rounded-full overflow-hidden shrink-0 bg-white shadow-2xs border border-emerald-800/15 ${dimensionClass} ${className}`}
    >
      <img
        src={logoUrl || logoImg}
        alt={alt || defaultAlt}
        className={`w-full h-full object-cover object-center select-none ${imgClassName}`}
        loading="eager"
        decoding="async"
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/logo.jpg';
        }}
      />
    </div>
  );

  if (!withText) {
    return logoGraphic;
  }

  return (
    <div className="flex items-center gap-3 text-left">
      {logoGraphic}
      <div className="flex flex-col">
        <span
          className={`font-bold tracking-tight text-slate-900 leading-tight ${
            textClassName || (size === 'lg' || size === 'xl' ? 'text-2xl' : 'text-lg sm:text-xl')
          }`}
        >
          {language === 'en' ? 'Ghorer Shad' : 'ঘরের স্বাদ'}
        </span>
        <span
          className={`text-xs text-emerald-800/90 font-medium tracking-wide ${
            taglineClassName || 'text-slate-500'
          }`}
        >
          {language === 'en' ? 'One destination for every authentic taste' : 'সব স্বাদের এক ঠিকানা'}
        </span>
      </div>
    </div>
  );
};
