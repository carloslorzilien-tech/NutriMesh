// src/components/BrandLogo.tsx — NutriMesh Isotipo Oficial PNG
import React from 'react';
import logoPng from '../assets/logo.png';

interface BrandLogoProps {
  size?: number;
  color?: string; // mantenido por compatibilidad de props
  className?: string;
  style?: React.CSSProperties;
}

export default function BrandLogo({
  size = 32,
  className = '',
  style = {},
}: BrandLogoProps) {
  return (
    <img
      src={logoPng}
      alt="NutriMesh"
      width={size}
      height={size}
      className={className}
      style={{
        display: 'block',
        width: size,
        height: size,
        objectFit: 'contain',
        flexShrink: 0,
        ...style,
      }}
    />
  );
}
