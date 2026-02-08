import React from 'react';
import { LayoutGrid } from 'lucide-react';

const IconWrapper = ({ children, className = "" }) => (
  <svg 
    viewBox="0 0 32 32" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={`w-full h-full drop-shadow-sm ${className}`}
  >
    {children}
  </svg>
);

// --- Colorful, Detailed Icons ---

const BananaIcon = () => (
  <IconWrapper>
    <path d="M7 26C7 26 4 24 4 18C4 11 10 4 23 2C25 1.6 27 2 27 2C27 2 26 4 20 8C14 12 11 18 12 23" fill="#FFD700" />
    <path d="M12 23L13 25" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" />
    <path d="M23 2C23 2 23 8 18 12" fill="#FCD34D" />
    <path d="M23 2L26 2" stroke="#4ADE80" strokeWidth="3" strokeLinecap="round" />
    <ellipse cx="12" cy="18" rx="1" ry="2" fill="#B45309" opacity="0.4" transform="rotate(-20 12 18)" />
  </IconWrapper>
);

const WatermelonIcon = () => (
  <IconWrapper>
    <path d="M2 16H30C30 23.732 23.732 30 16 30C8.268 30 2 23.732 2 16Z" fill="#EF4444" />
    <path d="M2 16H30C30 14 28 12 26 12H6C4 12 2 14 2 16Z" fill="#10B981" />
    <path d="M2 16H30" stroke="#DC2626" strokeWidth="1" opacity="0.2" />
    <path d="M6 14C6 14 10 15 16 15C22 15 26 14 26 14" stroke="#D1FAE5" strokeWidth="2" strokeLinecap="round" />
    <circle cx="11" cy="20" r="1.5" fill="#450A0A" />
    <circle cx="16" cy="24" r="1.5" fill="#450A0A" />
    <circle cx="21" cy="20" r="1.5" fill="#450A0A" />
    <circle cx="16" cy="19" r="1.5" fill="#450A0A" />
  </IconWrapper>
);

const OrangeIcon = () => (
  <IconWrapper>
    <circle cx="16" cy="17" r="11" fill="#F97316" />
    <circle cx="16" cy="17" r="9" field="url(#grad1)" fillOpacity="0.1" />
    <path d="M16 6V8" stroke="#166534" strokeWidth="2" strokeLinecap="round" />
    <path d="M16 8C16 8 19 5 21 6C23 7 21 10 16 8Z" fill="#4ADE80" />
    <path d="M16 8C16 8 13 6 12 7C11 8 13 10 16 8Z" fill="#22C55E" />
    {/* Pores */}
    <circle cx="12" cy="14" r="1" fill="#C2410C" fillOpacity="0.3" />
    <circle cx="19" cy="19" r="1" fill="#C2410C" fillOpacity="0.3" />
    <circle cx="15" cy="23" r="1" fill="#C2410C" fillOpacity="0.3" />
    <circle cx="21" cy="14" r="0.8" fill="#C2410C" fillOpacity="0.3" />
    <circle cx="9" cy="18" r="0.8" fill="#C2410C" fillOpacity="0.3" />
  </IconWrapper>
);

const PapayaIcon = () => (
  <IconWrapper>
    <path d="M16 2L21 7C25 11 27 17 25 23C23 29 16 30 16 30C16 30 9 29 7 23C5 17 7 11 11 7L16 2Z" fill="#F59E0B" />
    <ellipse cx="16" cy="19" rx="5" ry="8" fill="#FDBA74" />
    <circle cx="16" cy="16" r="1.5" fill="#451A03" />
    <circle cx="16" cy="12" r="1.5" fill="#451A03" />
    <circle cx="16" cy="20" r="1.5" fill="#451A03" />
    <circle cx="18" cy="18" r="1.3" fill="#451A03" />
    <circle cx="14" cy="18" r="1.3" fill="#451A03" />
    <circle cx="14" cy="14" r="1.3" fill="#451A03" />
    <circle cx="18" cy="14" r="1.3" fill="#451A03" />
    <circle cx="16" cy="24" r="1.3" fill="#451A03" />
  </IconWrapper>
);

const PineappleIcon = () => (
    <IconWrapper>
      <path d="M8 12C8 12 9 28 16 28C23 28 24 12 24 12H8Z" fill="#EAB308" />
      {/* Grid Pattern */}
      <path d="M8 12L16 28" stroke="#CA8A04" strokeWidth="1" strokeOpacity="0.5"/>
      <path d="M24 12L16 28" stroke="#CA8A04" strokeWidth="1" strokeOpacity="0.5"/>
      <path d="M12 12L19 28" stroke="#CA8A04" strokeWidth="1" strokeOpacity="0.5"/>
      <path d="M20 12L13 28" stroke="#CA8A04" strokeWidth="1" strokeOpacity="0.5"/>
      {/* Leaves */}
      <path d="M16 13V6" stroke="#15803D" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 12L12 4" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 12L20 4" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 12L8 8" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 12L24 8" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" />
    </IconWrapper>
);

const DragonFruitIcon = () => (
  <IconWrapper>
    <path d="M16 4C9 4 5 10 5 17C5 24 9 29 16 29C23 29 27 24 27 17C27 10 23 4 16 4Z" fill="#DB2777" />
    <path d="M16 4V2" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" />
    {/* Scales */}
    <path d="M12 9C12 9 8 13 9 17" stroke="#86EFAC" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M20 9C20 9 24 13 23 17" stroke="#86EFAC" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M16 14C16 14 13 18 16 22" stroke="#86EFAC" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M9 22C9 22 12 25 16 25" stroke="#86EFAC" strokeWidth="2" strokeLinecap="round" fill="none" />
  </IconWrapper>
);

const LycheeIcon = () => (
    <IconWrapper>
        <circle cx="16" cy="17" r="10" fill="#E11D48" />
        {/* Texture/Bumps */}
        <circle cx="12" cy="13" r="2" fill="#BE123C" />
        <circle cx="20" cy="13" r="2" fill="#BE123C" />
        <circle cx="16" cy="17" r="2" fill="#BE123C" />
        <circle cx="12" cy="21" r="2" fill="#BE123C" />
        <circle cx="20" cy="21" r="2" fill="#BE123C" />
        <circle cx="8" cy="17" r="1" fill="#BE123C" />
        <circle cx="24" cy="17" r="1" fill="#BE123C" />
        {/* Stem */}
        <path d="M16 8V4" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 4L13 6" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 4L19 6" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round" />
    </IconWrapper>
);

const MangoIcon = () => (
    <IconWrapper>
        <path d="M12 4C8 6 6 12 6 18C6 24 10 29 15 29C20 29 25 24 26 15C27 6 22 2 15 4" fill="#FBBF24" />
        <ellipse cx="12" cy="10" rx="3" ry="5" transform="rotate(-20 12 10)" fill="#F59E0B" opacity="0.5" />
        <path d="M15 4L16 2" stroke="#166534" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 2L12 4" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" />
    </IconWrapper>
);

const AllCategoryIcon = () => (
  <IconWrapper>
    <rect x="5" y="5" width="9" height="9" rx="2" fill="#F97316" fillOpacity="0.2" stroke="#F97316" strokeWidth="2" />
    <rect x="18" y="5" width="9" height="9" rx="2" fill="#FBBF24" fillOpacity="0.2" stroke="#FBBF24" strokeWidth="2" />
    <rect x="5" y="18" width="9" height="9" rx="2" fill="#10B981" fillOpacity="0.2" stroke="#10B981" strokeWidth="2" />
    <rect x="18" y="18" width="9" height="9" rx="2" fill="#EF4444" fillOpacity="0.2" stroke="#EF4444" strokeWidth="2" />
  </IconWrapper>
);

const GenericFruitIcon = () => (
  <IconWrapper>
     <path d="M12 21C12 21 7 19 7 13C7 9 11 6 16 6C21 6 25 9 25 13C25 19 20 21 20 21L16 23L12 21Z" fill="#F43F5E" />
     <path d="M16 6V3" stroke="#374151" strokeWidth="2" strokeLinecap="round" />
     <path d="M16 3C16 3 19 2 20 4" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" />
     <circle cx="20" cy="10" r="1.5" fill="white" fillOpacity="0.3" />
  </IconWrapper>
);

export const getCategoryIcon = (categoryName) => {
  const norm = categoryName.toLowerCase().trim();
  
  if (norm === 'ทั้งหมด') return <AllCategoryIcon />;
  if (norm.includes('กล้วย')) return <BananaIcon />;
  if (norm.includes('แตงโม')) return <WatermelonIcon />;
  if (norm.includes('ส้ม')) return <OrangeIcon />;
  if (norm.includes('มะละกอ')) return <PapayaIcon />;
  if (norm.includes('สับปะรด')) return <PineappleIcon />;
  if (norm.includes('แก้วมังกร')) return <DragonFruitIcon />;
  if (norm.includes('ลิ้นจี่')) return <LycheeIcon />;
  if (norm.includes('มะม่วง')) return <MangoIcon />;
  
  return <GenericFruitIcon />;
};

export const getCategoryColor = (categoryName) => {
    // Colors not currently used in the main design but kept for utility
    const norm = categoryName.toLowerCase().trim();
    if (norm === 'ทั้งหมด') return 'bg-gray-100/50';
    return 'bg-white';
};
