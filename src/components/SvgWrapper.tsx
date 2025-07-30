import React from "react";

type SvgWrapperProps = React.SVGAttributes<SVGElement> & {
  children: React.ReactNode;
  size?: number | string;
  viewBox?: string;
};

export const SvgWrapper: React.FC<SvgWrapperProps> = ({
  children,
  size = 24,
  viewBox = "0 0 24 24",
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
};
