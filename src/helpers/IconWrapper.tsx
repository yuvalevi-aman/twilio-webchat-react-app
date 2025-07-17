import * as React from 'react';
import type { HTMLAttributes } from 'react';

export interface IconWrapperProps extends HTMLAttributes<HTMLSpanElement> {
  size?: number | string;  
  color?: string;
  display?: 'inline-block' | 'inline-flex' | 'block' | 'flex';
  children?: React.ReactNode; 
}

export const IconWrapper: React.FC<IconWrapperProps> = ({
  size = 24,
  color = 'currentColor',
  style,
  children,
  ...props
}) => {
  return (
    <span
      {...props}
      style={{
        width: size,
        height: size,
        cursor: 'pointer',
        color,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        ...style,
      }}
    >
      {children}
    </span>
  );
};

IconWrapper.displayName = 'IconWrapper';
