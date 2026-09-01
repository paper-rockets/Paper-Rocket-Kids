import React from 'react';

interface SparkleStarProps {
  size?: number;
  className?: string;
  color?: string;
}

export const SparkleStar: React.FC<SparkleStarProps> = ({
  size = 24,
  className = '',
  color = '#FFE600',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block filter drop-shadow-[1px_1px_0px_#000000] ${className}`}
    >
      <path
        d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z"
        fill={color}
        stroke="#000000"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="2.5" fill="#FFFFFF" />
    </svg>
  );
};
