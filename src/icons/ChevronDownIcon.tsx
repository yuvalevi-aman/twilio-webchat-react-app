import * as React from 'react';
import { IconWrapper, IconWrapperProps } from '../helpers/IconWrapper';

export const ChevronDownIcon: React.FC<IconWrapperProps> = (props) => {
  return (
    <IconWrapper {...props}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-hidden="false"
        viewBox="0 0 20 20"
        fill="currentColor"
        width="100%"
        height="100%"
      >
        <title>Chevron Down</title>
        <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
      </svg>
    </IconWrapper>
  );
};

ChevronDownIcon.displayName = 'ChevronDownIcon';
