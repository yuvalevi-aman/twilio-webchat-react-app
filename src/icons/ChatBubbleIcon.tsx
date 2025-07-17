import * as React from 'react';
import { IconWrapper, IconWrapperProps } from '../helpers/IconWrapper';

export const ChatBubbleIcon: React.FC<IconWrapperProps> = (props) => {
  return (
    <IconWrapper {...props}>
 <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    viewBox="0 0 64 64"
    fill="#111111"
    role="img"
    aria-hidden="false"
  >
    <title>Speech Bubble Icon</title>
    <path d="M51,13H13c-3.9,0-7,3.1-7,7v20c0,3.9,3.1,7,7,7h6v8h2.8l8-8H51c3.9,0,7-3.1,7-7V20
      C58,16.1,54.9,13,51,13z M54,40c0,1.7-1.3,3-3,3H28.2L23,48.2V43H13c-1.7,0-3-1.3-3-3V20
      c0-1.7,1.3-3,3-3h38c1.7,0,3,1.3,3,3V40z"/>
  </svg>
    </IconWrapper>
  );
};

ChatBubbleIcon.displayName = 'ChatBubbleIcon';
