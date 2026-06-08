type LogoProps = { size?: number };

export function Logo({ size = 32 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      {/* Fondo verde */}
      <circle cx="24" cy="24" r="22" fill="#036b3e" />
      
      {/* Plato / base */}
      <path
        d="M12 34 C12 36 18 37 24 37 C30 37 36 36 36 34"
        fill="none"
        stroke="#e17c1e"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <ellipse cx="24" cy="34" rx="12" ry="2.5" fill="#e17c1e" opacity="0.8" />
      
      {/* Campana / cloche principal */}
      <path
        d="M14 28 C14 20 18 16 24 16 C30 16 34 20 34 28"
        fill="#e17c1e"
      />
      
      {/* Asa */}
      <path
        d="M19 16 C19 12 22 10 24 10 C26 10 29 12 29 16"
        stroke="#e17c1e"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Llama / fuego interior */}
      <path
        d="M22 20 C21 16 22 12 24 10 C26 12 27 16 26 20 C26 18 25 14 24 14 C23 14 22 18 22 20"
        fill="#fde9d9"
      />
      
      {/* Detalles de luz en la llama */}
      <circle cx="24" cy="15" r="1.2" fill="#e17c1e" opacity="0.4" />
    </svg>
  );
}
