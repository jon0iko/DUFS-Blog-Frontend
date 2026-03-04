import { serverStrapiAPI } from '@/lib/server-api';
import TextReelClient from './TextReelClient';

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

  return (
    <section
      aria-label="Tagline reel"
      className="w-full bg-[#E0D5D0] py-4 sm:py-5 md:py-6 overflow-hidden"
    >
      <TextReelClient text={label} baseDuration={220} reps={5} />
      {/* Accessible text for screen readers */}
      <p className="sr-only">{label}</p>
    </section>
  );
}
