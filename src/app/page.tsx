import { Hero } from '@/components/sections/Hero';
import { Excellence } from '@/components/sections/Excellence';
import { Journey } from '@/components/sections/Journey';
import { Services } from '@/components/sections/Services';
import { Why } from '@/components/sections/Why';
import { Workshop } from '@/components/sections/Workshop';
import { Testimonials } from '@/components/sections/Testimonials';
import { Contact } from '@/components/sections/Contact';
import { TornEdge } from '@/components/layout/TornEdge';

/**
 * Section order is the argument the page makes:
 * hook → credibility → process → capability → proof → evidence → voice → act.
 *
 * Sections alternate --bg (brand gray) and --bg-raised (white), which is what
 * produces the banded rhythm. The torn red band lands once, where the opening
 * gray statement gives way to the process — used sparingly so it stays an
 * event rather than a motif.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <Excellence />
      <TornEdge />
      <Journey />
      <Services />
      <Why />
      <Workshop />
      <Testimonials />
      <Contact />
    </>
  );
}
