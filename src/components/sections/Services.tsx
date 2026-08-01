'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { services, type Service } from '@/lib/site';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SplitHeading } from '@/components/ui/SplitHeading';

export function Services() {
  const root = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = root.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Cards rise in a diagonal wave — `grid` stagger reads the DOM order
        // against the rendered columns, so the wave follows the visual layout
        // rather than source order.
        gsap.from('[data-service-card]', {
          y: 64,
          autoAlpha: 0,
          duration: 1.15,
          ease: 'expo.out',
          stagger: { each: 0.06, grid: 'auto', from: 'start' },
          scrollTrigger: { trigger: '[data-service-grid]', start: 'top 82%', once: true },
        });
      });

      return () => mm.revert();
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="services"
      aria-labelledby="services-heading"
      className="relative border-t border-[var(--line)] bg-[var(--bg)] py-[var(--spacing-section)]"
    >
      {/* Ambient red bloom anchoring the section — pure CSS, no paint cost. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[36rem] bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,rgba(232,30,38,0.10),transparent_70%)]"
      />

      <div className="shell relative">
        <SectionHeader index="03" label="Capabilities" />

        <div className="mt-10 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <SplitHeading as="h2" id="services-heading" mode="lines" className="t-display text-display max-w-[13ch]">
            Everything the
            <br />
            vehicle needs.
          </SplitHeading>

          <p className="max-w-[38ch] text-lead text-[var(--fg-muted)] md:text-right">
            Eight disciplines under one roof — which is why a repair here does not
            wait on a subcontractor.
          </p>
        </div>

        {/* 4 columns, not 3: eight cards divide evenly into two full rows, so
            the grid never ends on a ragged part-row. */}
        <ul
          data-service-grid
          className="mt-16 grid gap-px border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-4"
        >
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </ul>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Glass card with pointer-driven 3D tilt.
 *
 * Three things happen on pointer move, all written straight to the DOM:
 *   · the card rotates on X/Y toward the pointer (quickTo-smoothed)
 *   · a specular spotlight tracks the pointer via CSS custom properties
 *   · the content lifts on Z, so it parallaxes against the card face
 *
 * `transform-style: preserve-3d` on the card plus `perspective` on the <li> is
 * what makes the lift genuinely three-dimensional instead of a scale.
 */
function ServiceCard({ service }: { service: Service }) {
  const card = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const rotX = useRef<((v: number) => void) | null>(null);
  const rotY = useRef<((v: number) => void) | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (!card.current) return;
    rotX.current = gsap.quickTo(card.current, 'rotationX', { duration: 0.6, ease: 'power3.out' });
    rotY.current = gsap.quickTo(card.current, 'rotationY', { duration: 0.6, ease: 'power3.out' });
  }, []);

  const onMove = (e: React.PointerEvent<HTMLLIElement>) => {
    const el = card.current;
    if (!el || e.pointerType !== 'mouse') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    // ±6° is the ceiling: past that, text on the far edge visibly softens.
    rotY.current?.((px - 0.5) * 12);
    rotX.current?.(-(py - 0.5) * 12);

    el.style.setProperty('--mx', `${px * 100}%`);
    el.style.setProperty('--my', `${py * 100}%`);
  };

  const onEnter = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.to(content.current, { z: 42, duration: 0.7, ease: 'expo.out' });
    gsap.to(card.current, { '--spot': 1, duration: 0.5 } as gsap.TweenVars);
  };

  const onLeave = () => {
    rotX.current?.(0);
    rotY.current?.(0);
    gsap.to(content.current, { z: 0, duration: 0.9, ease: 'expo.out' });
    gsap.to(card.current, { '--spot': 0, duration: 0.6 } as gsap.TweenVars);
  };

  return (
    <li
      data-service-card
      onPointerMove={onMove}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      className="[perspective:1200px]"
    >
      <div
        ref={card}
        data-cursor="link"
        style={{ ['--spot' as string]: 0, ['--mx' as string]: '50%', ['--my' as string]: '50%' }}
        className="group relative flex h-full flex-col overflow-hidden bg-[var(--bg-raised)] transition-colors duration-500 [transform-style:preserve-3d] hover:bg-[var(--bg-panel)]"
      >
        {/* --- media --- */}
        <div className="relative aspect-4/3 w-full shrink-0 overflow-hidden bg-[var(--bg-inset)]">
          <Image
            src={service.image}
            alt=""
            fill
            // 4 columns at desktop, 2 at tablet, 1 at phone.
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-[1.1s] [transition-timing-function:var(--ease-out-expo)] group-hover:scale-[1.06]"
          />

          {/* Scrim for the index + arrow, which sit over photography. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-black/70 to-transparent"
          />

          <span className="absolute left-5 top-4 font-[family-name:var(--font-mono)] text-[10px] tabular-nums tracking-[0.2em] text-white/90">
            {service.index}
          </span>

          {/* Arrow that swings up-right on hover. */}
          <svg
            viewBox="0 0 16 16"
            aria-hidden
            className="absolute right-5 top-4 h-4 w-4 text-white/80 transition-all duration-500 [transition-timing-function:var(--ease-out-expo)] group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-[var(--color-red-hot)]"
          >
            <path d="M3 13 13 3M6 3h7v7" fill="none" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </div>

        {/* Specular spotlight following the pointer. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[var(--spot)] transition-opacity duration-500"
          style={{
            background:
              'radial-gradient(28rem circle at var(--mx) var(--my), rgba(232,30,38,0.16), transparent 62%)',
          }}
        />
        {/* Hairline that ignites along the top edge on hover. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px origin-left scale-x-0 bg-[var(--color-red)] transition-transform duration-700 [transition-timing-function:var(--ease-out-expo)] group-hover:scale-x-100"
        />

        <div ref={content} className="relative flex h-full flex-col justify-between p-7 [transform-style:preserve-3d]">
          <div>
            <h3 className="t-display text-title tracking-[-0.02em]">{service.title}</h3>

            <p className="mt-4 text-sm leading-relaxed text-[var(--fg-muted)]">{service.body}</p>

            {/* Detail list revealed on hover — keeps the resting card calm while
                rewarding intent. Height animates so the card never jumps. */}
            <ul className="mt-0 grid grid-rows-[0fr] transition-[grid-template-rows] duration-700 [transition-timing-function:var(--ease-out-expo)] group-hover:mt-5 group-hover:grid-rows-[1fr]">
              <li className="overflow-hidden">
                <span className="flex flex-wrap gap-x-4 gap-y-1.5">
                  {service.points.map((point) => (
                    <span
                      key={point}
                      className="font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-[0.16em] text-[var(--fg-subtle)]"
                    >
                      {point}
                    </span>
                  ))}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </li>
  );
}
