import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2L14 7L12 12L10 7L12 2Z" />
      <path d="M12 12L15 22L12 17L9 22L12 12Z" />
      <path d="M2 12H22" />
      <path d="M7 2L12 12L7 22" />
      <path d="M17 2L12 12L17 22" />
    </svg>
  );
}
