/**
 * Central media registry — swap placeholders for Supabase Storage URLs
 * production-side. Keeps the rest of the app decoupled from where files live.
 */

// Brand — static assets in /public. Replace by dropping files with the same
// filename in /public/ (no code change required).
export const media = {
  // Logo — dark variant (for use over LIGHT backgrounds like the scrolled nav
  // and the footer's white pill). Drop your PNG (transparent bg) at
  // /public/logo.png to override.
  logo: '/logo.png',
  // Light variant (for use over DARK backgrounds like the hero-transparent
  // navbar and the ZUI story). Drop /public/logo-light.png to override.
  logoLight: '/logo-light.png',
  logoFallback: '/logo.jpg',
  heroPoster: '/hero-poster.jpg',
  heroVideo: '/hero-video.mp4',
};

// Flag CDN — free, MIT-licensed set. e.g. https://flagcdn.com/w160/sn.png
export const flag = (iso, size = 80) => `https://flagcdn.com/w${size}/${iso}.png`;

// Marketing illustrations — Unsplash for now; replace with real assets later.
// Kept keys stable so swapping to Supabase is a one-file change.
const u = (id, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const illustration = {
  // Hero + event families
  ticketing: u('1470229722913-7c0e2dbbafd3'),
  votes: u('1540575467063-178a50c2df87'),
  donations: u('1593113630400-ea4288922497'),
  crowdfunding: u('1521737604893-d14cc237f11d'),
  contests: u('1513151233558-d860c5398176'),
  sponsoring: u('1521737711867-e3b97375f902'),
  // How it works
  create: u('1454165804606-c3d57bc86b40'),
  configure: u('1531403009284-440f080d1e12'),
  share: u('1611926653458-09294b3142bf'),
  cashout: u('1556742049-0cfed4f6a45d'),
  // Pricing teaser
  pricing: u('1553729459-efe14ef6055d'),
  // Sub-cause imagery (Système de dons — Zoom-2 cards)
  health: u('1576091160399-112ba8d25d1d', 700),
  studies: u('1523240795612-9a054b0db644', 700),
  solidarity: u('1509099836639-18ba1795216d', 700),
  projects: u('1552664730-d307ca884978', 700),
  // Zoom-2 generic (Comment ça marche / Pour qui / Confiance)
  howGeneric: u('1519389950473-47ba0277781c', 700),
  audience: u('1523240795612-9a054b0db644', 700),
  trust: u('1450101499163-c8848c66ca85', 700),
};
