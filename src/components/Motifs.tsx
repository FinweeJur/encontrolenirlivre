/**
 * Motivos gráficos da identidade do encontro: sol, raízes, estrela e seta.
 * Tudo em SVG para escalar sem perder traço e acompanhar o tema.
 */

export function Sun({ className = "" }: { className?: string }) {
  const rays = Array.from({ length: 24 }, (_, i) => i * 15);
  return (
    <svg
      className={className}
      viewBox="0 0 400 400"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="200" cy="200" r="92" fill="currentColor" />
      {rays.map((angle) => (
        <line
          key={angle}
          x1="200"
          y1="42"
          x2="200"
          y2="12"
          stroke="currentColor"
          strokeWidth="7"
          strokeLinecap="round"
          transform={`rotate(${angle} 200 200)`}
        />
      ))}
    </svg>
  );
}

export function Roots({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 600 320"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <g stroke="currentColor" strokeWidth="3.2" strokeLinecap="round">
        <path d="M300 8v52" />
        <path d="M300 60c-12 34-48 52-72 86" />
        <path d="M300 60c12 34 48 52 72 86" />
        <path d="M228 146c-30 18-58 40-78 74" />
        <path d="M228 146c-18 30-24 62-20 94" />
        <path d="M372 146c30 18 58 40 78 74" />
        <path d="M372 146c18 30 24 62 20 94" />
        <path d="M150 220c-34 12-62 32-82 60" />
        <path d="M150 220c-20 26-30 54-30 84" />
        <path d="M208 240c-8 30-8 58 2 84" />
        <path d="M450 220c34 12 62 32 82 60" />
        <path d="M450 220c20 26 30 54 30 84" />
        <path d="M392 240c8 30 8 58-2 84" />
        <path d="M300 108c-6 30-6 58 0 86" />
        <path d="M300 194c-10 34-10 66 0 98" />
        <path d="M300 292c-6 8-8 16-8 24" />
        <path d="M68 280c-10 10-16 20-20 32" />
        <path d="M120 304c-6 8-10 14-12 22" />
        <path d="M480 304c6 8 10 14 12 22" />
        <path d="M532 280c10 10 16 20 20 32" />
        <path d="M260 318c-4 6-6 12-6 18" />
        <path d="M340 318c4 6 6 12 6 18" />
      </g>
      <g fill="currentColor">
        <circle cx="300" cy="12" r="4" />
        <circle cx="68" cy="296" r="3" />
        <circle cx="532" cy="296" r="3" />
        <circle cx="260" cy="322" r="2.5" />
        <circle cx="340" cy="322" r="2.5" />
      </g>
    </svg>
  );
}

export function Spark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 0c.8 7.2 4.8 11.2 12 12-7.2.8-11.2 4.8-12 12-.8-7.2-4.8-11.2-12-12C7.2 11.2 11.2 7.2 12 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M4 12h15M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="square"
      />
    </svg>
  );
}
