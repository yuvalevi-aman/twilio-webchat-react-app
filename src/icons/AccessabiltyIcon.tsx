import * as React from 'react';
import { IconWrapper, IconWrapperProps } from '../helpers/IconWrapper';

export const AccessibilityIcon: React.FC<IconWrapperProps> = (props) => {
  return (
    <IconWrapper {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 64 64" fill="none" stroke="#111">
        <circle cx="31.92" cy="15.52" r="3.68" fill="#111"/>
        <path d="M52.51 9.19v25.11c0 11.31-9.2 20.51-20.51 20.51s-20.51-9.2-20.51-20.51V9.19h41.03"/>
        <rect x="27.07" y="22.73" width="10.05" height="13.39" fill="#111"/>
        <rect x="33.74" y="35.47" width="3.37" height="11.56" fill="#111"/>
        <rect x="27.07" y="35.49" width="3.36" height="11.56" fill="#111"/>
  <path d="M17.13 20.94s9.21 1.53 15.03 1.53 14.8-1.53 14.8-1.53" stroke="#111" strokeWidth="2.86" fill="none"/>
</svg>
    </IconWrapper>
  );
};

AccessibilityIcon.displayName = 'AccessibilityIcon';
