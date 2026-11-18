import type { SVGProps } from 'react';

/** Small line icons drawn for this prototype (24px grid, 1.75 stroke). */
type P = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 16, children, ...rest }: P & { children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
      {children}
    </svg>
  );
}

export const IconMark = (p: P) => (
  <Svg {...p}>
    <path d="M5 13.5 9.5 18 19 6.5" strokeWidth={2.25} />
  </Svg>
);
export const IconCycle = (p: P) => (
  <Svg {...p}>
    <rect x="3.5" y="5" width="17" height="15" rx="2" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </Svg>
);
export const IconPeople = (p: P) => (
  <Svg {...p}>
    <circle cx="9" cy="8.5" r="3.25" />
    <path d="M3 19.5c.6-3.2 3-5 6-5s5.4 1.8 6 5" />
    <path d="M15.5 5.6a3 3 0 0 1 0 5.8M17.5 14.8c1.8.6 3 2.2 3.4 4.7" />
  </Svg>
);
export const IconScale = (p: P) => (
  <Svg {...p}>
    <path d="M12 4v16M7 20h10M5 7h14" />
    <path d="M5 7 2.5 13a2.6 2.6 0 0 0 5 0L5 7ZM19 7l-2.5 6a2.6 2.6 0 0 0 5 0L19 7Z" />
  </Svg>
);
export const IconMap = (p: P) => (
  <Svg {...p}>
    <path d="M4 4v16h16" />
    <circle cx="9" cy="14" r="1.4" />
    <circle cx="13" cy="9.5" r="1.4" />
    <circle cx="17" cy="7" r="1.4" />
    <circle cx="15" cy="14.5" r="1.4" />
  </Svg>
);
export const IconLog = (p: P) => (
  <Svg {...p}>
    <path d="M8 6h12M8 12h12M8 18h12" />
    <circle cx="4" cy="6" r=".6" fill="currentColor" />
    <circle cx="4" cy="12" r=".6" fill="currentColor" />
    <circle cx="4" cy="18" r=".6" fill="currentColor" />
  </Svg>
);
export const IconTarget = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r=".8" fill="currentColor" />
  </Svg>
);
export const IconPen = (p: P) => (
  <Svg {...p}>
    <path d="M14.5 5.5 18.5 9.5M4 20l1-4.5L15.8 4.7a1.8 1.8 0 0 1 2.5 0l1 1a1.8 1.8 0 0 1 0 2.5L8.5 19 4 20Z" />
  </Svg>
);
export const IconResult = (p: P) => (
  <Svg {...p}>
    <path d="M6 3.5h9l3.5 3.5v13.5H6z" />
    <path d="M9 12.5l2 2 4-4.5" />
  </Svg>
);
export const IconLock = (p: P) => (
  <Svg {...p}>
    <rect x="5" y="10.5" width="14" height="10" rx="2" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
  </Svg>
);
export const IconAlert = (p: P) => (
  <Svg {...p}>
    <path d="M12 4 2.8 19.5h18.4L12 4Z" />
    <path d="M12 10v4.5M12 17.2v.1" />
  </Svg>
);
export const IconInfo = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5.5M12 7.8v.1" />
  </Svg>
);
export const IconCheck = (p: P) => (
  <Svg {...p}>
    <path d="M5 12.5 10 17.5 19 7" />
  </Svg>
);
export const IconFlag = (p: P) => (
  <Svg {...p}>
    <path d="M5 21V4M5 4.5h11l-2 4 2 4H5" />
  </Svg>
);
export const IconClock = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Svg>
);
export const IconArrowUp = (p: P) => (
  <Svg {...p}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </Svg>
);
export const IconChevron = (p: P) => (
  <Svg {...p}>
    <path d="m9 6 6 6-6 6" />
  </Svg>
);
export const IconClose = (p: P) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);
export const IconLink = (p: P) => (
  <Svg {...p}>
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
    <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
  </Svg>
);
export const IconBell = (p: P) => (
  <Svg {...p}>
    <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15L6 16Z" />
    <path d="M10 20.5a2 2 0 0 0 4 0" />
  </Svg>
);
export const IconUserX = (p: P) => (
  <Svg {...p}>
    <circle cx="10" cy="8.5" r="3.5" />
    <path d="M3.5 19.5c.7-3.4 3.2-5.2 6.5-5.2 1.4 0 2.6.3 3.7.9M16 15l4 4M20 15l-4 4" />
  </Svg>
);
export const IconCalendar = (p: P) => (
  <Svg {...p}>
    <rect x="3.5" y="5" width="17" height="15" rx="2" />
    <path d="M3.5 10h17M8 3v4M16 3v4M8 14h2M14 14h2M8 17h2" />
  </Svg>
);
