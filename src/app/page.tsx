import { Hero } from '@/components/sections/Hero';
import { Excellence } from '@/components/sections/Excellence';
import { Journey } from '@/components/sections/Journey';
import { Services } from '@/components/sections/Services';
import { Why } from '@/components/sections/Why';
import { Testimonials } from '@/components/sections/Testimonials';
import { Contact } from '@/components/sections/Contact';

/**
 * Section order is the argument the page makes:
 * hook → credibility → process → capability → proof → evidence → voice → act.
 *
 * Sections alternate --bg (brand gray) and --bg-raised (white), which is what
 * produces the banded rhythm.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <Excellence />
      <Journey />
      <Services />
      <Why />
      <Testimonials />
      <Contact />
    </>
  );
}
