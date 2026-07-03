/**
 * Centralised media registry.
 *
 * Architecture (per UML Component Diagram — Layer 5 "File Storage (S3)"):
 *   - Production media (event covers, user uploads, dynamic assets)
 *       → Supabase Storage buckets, served via signed / public URLs.
 *   - Static brand assets (logo, hero video/poster, marketing illustrations)
 *       → repo /public folder for now, referenced by stable paths below.
 *
 * To switch a placeholder to a real Supabase asset, change ONLY the value here.
 * Example once Supabase Storage is wired:
 *   logo: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/brand/logo.jpg`
 */

// --- Brand / static (public folder) ---------------------------------------
export const media = {
  logo: '/logo.jpg',
  heroPoster: '/hero-poster.jpg',
  heroVideo: '/hero-video.mp4', // to be provided later; falls back to heroPoster
};

// --- Marketing illustrations (temporary web images, swappable) --------------
// Remote, royalty-free placeholders. Replace with Supabase Storage URLs later.
export const illustration = {
  ticketing:
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=900&q=80',
  votes:
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80',
  donations:
    'https://images.unsplash.com/photo-1593113630400-ea4288922497?auto=format&fit=crop&w=900&q=80',
  crowdfunding:
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80',
  contests:
    'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=900&q=80',
  // "How it works" step imagery
  create:
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80',
  configure:
    'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=900&q=80',
  share:
    'https://images.unsplash.com/photo-1611926653458-09294b3142bf?auto=format&fit=crop&w=900&q=80',
  cashout:
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=80',
  // Pricing teaser
  pricing:
    'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=900&q=80',
  // Sub-cause imagery (donation level 3)
  health:
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=700&q=80',
  studies:
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=700&q=80',
  solidarity:
    'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=700&q=80',
  projects:
    'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=700&q=80',
};
