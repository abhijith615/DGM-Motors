'use client';

import { gsap } from '@/lib/gsap';
import { navLinks, services, site, whatsappUrl } from '@/lib/site';
import { Logo } from '@/components/ui/Logo';
import { Magnetic } from '@/components/ui/Magnetic';

export function Footer() {
  const toTop = () => {
    gsap.to(window, { duration: 1.6, ease: 'expo.inOut', scrollTo: { y: 0, autoKill: true } });
  };

  const socials = Object.entries(site.social).filter(([, href]) => href);

  return (
    <footer className="relative overflow-hidden border-t border-[var(--line)] bg-[var(--bg-raised)]">
      <div className="shell py-20 md:py-28">
        {/* --- top row --- */}
        <div className="grid-swiss gap-y-14">
          <div className="col-span-12 lg:col-span-5">
            <Logo width={280} className="h-8 w-auto md:h-10" />
            <p className="mt-7 max-w-[42ch] text-sm leading-relaxed text-[var(--fg-muted)]">{site.description}</p>

            <div className="mt-9 flex flex-wrap gap-2">
              <Magnetic strength={0.25}>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="link"
                  className="inline-flex items-center gap-2.5 rounded-[var(--radius-pill)] bg-[var(--color-red)] px-6 py-3 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-white"
                >
                  {site.contact.whatsapp.label}
                </a>
              </Magnetic>
              <Magnetic strength={0.25}>
                <a
                  href={`tel:${site.contact.phone.tel}`}
                  data-cursor="link"
                  className="inline-flex items-center gap-2.5 rounded-[var(--radius-pill)] border border-[var(--line-strong)] px-6 py-3 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.2em] transition-colors hover:border-[var(--color-red)]"
                >
                  {site.contact.phone.label}
                </a>
              </Magnetic>
            </div>
          </div>

          <nav aria-label="Footer" className="col-span-6 md:col-span-4 lg:col-span-2 lg:col-start-7">
            <h2 className="t-meta mb-6">Sections</h2>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    data-cursor="link"
                    className="text-sm text-[var(--fg-muted)] transition-colors hover:text-[var(--accent-text)]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-6 md:col-span-4 lg:col-span-3">
            <h2 className="t-meta mb-6">Services</h2>
            <ul className="space-y-3">
              {services.slice(0, 6).map((service) => (
                <li key={service.id}>
                  <a
                    href="#services"
                    data-cursor="link"
                    className="text-sm text-[var(--fg-muted)] transition-colors hover:text-[var(--accent-text)]"
                  >
                    {service.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <address className="col-span-12 not-italic md:col-span-4 lg:col-span-2">
            <h2 className="t-meta mb-6">Workshop</h2>
            <p className="text-sm leading-relaxed text-[var(--fg-muted)]">
              {site.address.street}
              <br />
              {site.address.locality}
              <br />
              {site.address.region} {site.address.postalCode}
              <br />
              {site.address.countryName}
            </p>
            <p className="mt-5 text-sm text-[var(--fg-muted)]">{site.contact.hours}</p>
            <p className="mt-1 text-sm text-[var(--accent-text)]">{site.contact.emergency}</p>

            {socials.length > 0 && (
              <ul className="mt-6 flex gap-4">
                {socials.map(([name, href]) => (
                  <li key={name}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor="link"
                      className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.18em] text-[var(--fg-subtle)] transition-colors hover:text-[var(--accent-text)]"
                    >
                      {name}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </address>
        </div>

        {/* --- legal --- */}
        <div className="mt-20 flex flex-col gap-5 border-t border-[var(--line)] pt-7 md:mt-28 md:flex-row md:items-center md:justify-between">
          <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.18em] text-[var(--fg-subtle)]">
            © {new Date().getFullYear()} {site.legalName} · {site.serviceAreas.join(' · ')}
          </p>

          <button
            type="button"
            onClick={toTop}
            data-cursor="link"
            className="group flex items-center gap-3 self-start font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.18em] text-[var(--fg-subtle)] transition-colors hover:text-[var(--fg)] md:self-auto"
          >
            Back to top
            <span className="relative block h-8 w-px overflow-hidden bg-[var(--line-strong)]">
              <span className="absolute inset-x-0 bottom-0 block h-3 bg-[var(--color-red)] transition-transform duration-700 [transition-timing-function:var(--ease-out-expo)] group-hover:-translate-y-5" />
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}
