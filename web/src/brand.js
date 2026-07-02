// Nurshahar brand assets — hand-drawn SVG mascot ("Robo") and wordmark icon.
// No external image files: everything is inline markup so the project stays
// a pure static site. Outline strokes use currentColor so CSS can retint
// the mascot per mood (default / happy / alert) via the .mentor-avatar color.

export const MASCOT_SVG = `
<svg viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg" class="mascot-svg" aria-hidden="true">
  <defs>
    <radialGradient id="mascotGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffe9a8" />
      <stop offset="100%" stop-color="#ffd76a" stop-opacity="0" />
    </radialGradient>
  </defs>
  <line x1="50" y1="13" x2="50" y2="22" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
  <circle cx="50" cy="9" r="8" fill="url(#mascotGlow)" />
  <circle cx="50" cy="9" r="4" fill="#ffd76a" />
  <rect x="22" y="66" width="56" height="40" rx="16" fill="#142035" stroke="currentColor" stroke-width="3" />
  <circle cx="18" cy="82" r="6" fill="#142035" stroke="currentColor" stroke-width="2.5" />
  <circle cx="82" cy="82" r="6" fill="#142035" stroke="currentColor" stroke-width="2.5" />
  <circle cx="50" cy="86" r="11" fill="url(#mascotGlow)" />
  <circle cx="50" cy="86" r="7" fill="#ffd76a" />
  <circle cx="50" cy="40" r="26" fill="#142035" stroke="currentColor" stroke-width="3" />
  <circle cx="40" cy="38" r="5" fill="currentColor" />
  <circle cx="60" cy="38" r="5" fill="currentColor" />
  <path d="M38 50 Q50 58 62 50" fill="none" stroke="#ffd76a" stroke-width="2.5" stroke-linecap="round" />
</svg>`;

export const LOGO_MARK_SVG = `
<svg viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg" class="logo-mark" aria-hidden="true">
  <defs>
    <radialGradient id="logoGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffe9a8" />
      <stop offset="100%" stop-color="#ffd76a" stop-opacity="0" />
    </radialGradient>
  </defs>
  <line x1="50" y1="10" x2="50" y2="20" stroke="#5cc8ff" stroke-width="4" stroke-linecap="round" />
  <circle cx="50" cy="7" r="7" fill="url(#logoGlow)" />
  <circle cx="50" cy="7" r="4" fill="#ffd76a" />
  <circle cx="50" cy="42" r="27" fill="#0b0f1a" stroke="#5cc8ff" stroke-width="4" />
  <circle cx="39" cy="40" r="5.5" fill="#5cc8ff" />
  <circle cx="61" cy="40" r="5.5" fill="#5cc8ff" />
</svg>`;

export const FAVICON_DATA_URI = 'data:image/svg+xml,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="#05070c"/>
  <line x1="50" y1="18" x2="50" y2="28" stroke="#5cc8ff" stroke-width="6" stroke-linecap="round"/>
  <circle cx="50" cy="12" r="7" fill="#ffd76a"/>
  <circle cx="50" cy="58" r="32" fill="#0e1524" stroke="#5cc8ff" stroke-width="5"/>
  <circle cx="37" cy="56" r="7" fill="#5cc8ff"/>
  <circle cx="63" cy="56" r="7" fill="#5cc8ff"/>
</svg>`);
