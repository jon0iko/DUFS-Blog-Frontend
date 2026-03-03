import { serverStrapiAPI } from '@/lib/server-api';

const REPS = 5; // items per copy — space-around distributes them evenly across the viewport

const DEFAULT_TEXT = "Better Films · Better Viewers ·";

export default async function TextReel() {
  let text = DEFAULT_TEXT;
  try {
    const fetched = await serverStrapiAPI.getTextReelContent();
    if (fetched?.trim()) text = fetched.trim();
  } catch {
    // Backend unavailable — fall back to default text
    console.log('Failed to fetch Text Reel content, using default.');
  }

  const label = text.trim();

  const items = Array.from({ length: REPS }, (_, i) => (
    <span
      key={i}
      className="
        inline-block
        text-black font-black uppercase tracking-normal
        text-4xl sm:text-5xl md:text-7xl lg:text-7xl
      "
    >
      {label}
    </span>
  ));

  return (
    <section
      aria-label="Tagline reel"
      className="w-full bg-[#E0D5D0] py-4 sm:py-5 md:py-6"
    >
      <div className="marquee" aria-hidden="true">
        {/* First copy */}
        <div className="marquee-content marquee-scroll">{items}</div>
        {/* Second copy — fills the gap as the first scrolls away */}
        <div className="marquee-content marquee-scroll" aria-hidden="true">
          {items}
        </div>
      </div>
      {/* Accessible text for screen readers */}
      <p className="sr-only">{label}</p>
    </section>
  );
}
