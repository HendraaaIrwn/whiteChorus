import type { SVGProps } from "react";

type DoodleProps = SVGProps<SVGSVGElement>;

export const chorusWavePath =
  "M0 126C62 126 62 44 125 44C188 44 188 193 250 193C313 193 313 73 375 73C438 73 438 157 500 157C563 157 563 23 625 23C688 23 688 208 750 208C813 208 813 92 875 92C938 92 938 126 1000 126";

export function ThreadStroke({
  withArrow = true,
  ...props
}: DoodleProps & { withArrow?: boolean }) {
  return (
    <svg viewBox="0 0 520 190" fill="none" {...props}>
      <path
        d="M6 129C80 31 132 166 207 82C270 11 316 167 389 91C430 48 466 47 515 78"
        pathLength="1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {withArrow ? (
        <path
          d="M441 72L474 60L461 92"
          pathLength="1"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
    </svg>
  );
}

export function Sparkle(props: DoodleProps) {
  return (
    <svg viewBox="0 0 100 100" fill="none" {...props}>
      <path
        d="M50 4C54 31 66 45 96 50C66 55 54 69 50 96C46 69 34 55 4 50C34 45 46 31 50 4Z"
        fill="currentColor"
        stroke="var(--home-fg-heading)"
        strokeLinejoin="round"
        strokeWidth="3"
      />
    </svg>
  );
}

export function Bow(props: DoodleProps) {
  return (
    <svg viewBox="0 0 220 160" fill="none" {...props}>
      <path
        d="M108 80C75 26 14 18 16 58C18 95 65 102 108 80ZM112 80C145 26 206 18 204 58C202 95 155 102 112 80ZM109 82C83 105 74 133 82 151M112 82C141 104 151 130 143 151"
        stroke="var(--home-brand-strong)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="110"
        cy="79"
        r="14"
        fill="var(--home-bg-card)"
        stroke="var(--home-brand-strong)"
        strokeWidth="5"
      />
    </svg>
  );
}

export function ChorusWave(props: DoodleProps) {
  return (
    <svg viewBox="0 0 1000 240" fill="none" {...props}>
      <path
        d={chorusWavePath}
        pathLength="1"
        stroke="currentColor"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function StitchedArrow(props: DoodleProps) {
  return (
    <svg viewBox="0 0 260 110" fill="none" {...props}>
      <path
        d="M8 66C64 29 132 30 221 58"
        stroke="currentColor"
        strokeDasharray="5 12"
        strokeLinecap="round"
      />
      <path
        d="M198 35L231 61L195 76"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
