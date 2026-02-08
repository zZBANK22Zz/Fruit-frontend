
import React from 'react';

/**
 * OrangeSpinner
 * A pure SVG component that renders a spinning orange fruit.
 * No external image file required, ensuring transparent background.
 */
export default function OrangeSpinner({ className = "w-5 h-5" }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`animate-spin ${className}`}
    >
      {/* Orange Body */}
      <circle cx="12" cy="12" r="9" fill="#F97316" stroke="#EA580C" strokeWidth="1.5" />
      
      {/* Shine/Highlight */}
      <path 
        d="M6.5 8.5C6.5 8.5 8 5.5 12 5.5" 
        stroke="#FDBA74" 
        strokeWidth="1.5" 
        strokeLinecap="round"
      />
      
      {/* Leaf */}
      <path 
        d="M12 3C12 3 13.5 1.5 15.5 2.5C17.5 3.5 16.5 6 15 6L12 3Z" 
        fill="#4ADE80" 
        stroke="#16A34A" 
        strokeWidth="1"
        strokeLinejoin="round"
      />
      
      {/* Texture Dots */}
      <circle cx="9" cy="14" r="0.5" fill="#C2410C" fillOpacity="0.6" />
      <circle cx="15" cy="11" r="0.5" fill="#C2410C" fillOpacity="0.6" />
      <circle cx="13" cy="16" r="0.5" fill="#C2410C" fillOpacity="0.6" />
    </svg>
  );
}
