'use client';

import { useId, useRef, useState } from 'react';
import { contact, mapEmbedUrl, site, whatsappUrl } from '@/lib/site';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SplitHeading } from '@/components/ui/SplitHeading';
import { Reveal } from '@/components/ui/Reveal';
import { Button } from '@/components/ui/Button';
import { Magnetic } from '@/components/ui/Magnetic';

type Errors = Partial<Record<'name' | 'phone' | 'message', string>>;

export function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="relative border-t border-[var(--line)] bg-[var(--bg)] py-[var(--spacing-section)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[30rem] bg-[radial-gradient(ellipse_70%_100%_at_50%_100%,rgba(232,30,38,0.12),transparent_70%)]"
      />

      <div className="shell relative">
        <SectionHeader index={contact.index} label={contact.eyebrow} />

        <div className="grid-swiss mt-12 gap-y-16 md:mt-16">
          {/* --- left: statement + details --- */}
          <div className="col-span-12 lg:col-span-5">
            <SplitHeading as="h2" id="contact-heading" mode="lines" className="t-display text-display">
              {contact.headline.split('\n').map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </SplitHeading>

            <Reveal variant="rise" delay={0.1}>
              <p className="mt-8 max-w-[46ch] text-lead text-[var(--fg-muted)]">{contact.body}</p>
            </Reveal>

            <Reveal variant="rise" stagger={0.08} className="mt-12 space-y-px" delay={0.15}>
              <ContactRow label="Telephone" value={site.contact.phone.label} href={`tel:${site.contact.phone.tel}`} />
              <ContactRow label="Email" value={site.contact.email} href={`mailto:${site.contact.email}`} />
              <ContactRow
                label="Workshop"
                value={`${site.address.street}, ${site.address.locality}, ${site.address.region} ${site.address.postalCode}`}
              />
              <ContactRow label="Hours" value={site.contact.hours} />
              <ContactRow label="Emergency" value={site.contact.emergency} accent />
            </Reveal>

            <div className="mt-10">
              <Magnetic strength={0.26}>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="link"
                  className="group inline-flex items-center gap-4 rounded-[var(--radius-pill)] bg-[var(--color-red)] px-8 py-4 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-white glow-red"
                >
                  {site.contact.whatsapp.label}
                  <span className="block h-px w-6 origin-left bg-current transition-transform duration-500 [transition-timing-function:var(--ease-out-expo)] group-hover:scale-x-150" />
                </a>
              </Magnetic>
            </div>
          </div>

          {/* --- right: form --- */}
          <div className="col-span-12 lg:col-span-6 lg:col-start-7">
            <EnquiryForm />
          </div>
        </div>

        {/* --- map --- */}
        <Reveal variant="clip" duration={1.4} className="mt-24 md:mt-32">
          <div className="relative aspect-16/9 w-full overflow-hidden rounded-[var(--radius-panel)] border border-[var(--line)] md:aspect-21/9">
            <iframe
              src={mapEmbedUrl}
              title={`Map showing ${site.name} in ${site.address.locality}, ${site.address.region}`}
              // Lazy: the map is well below the fold and costs ~500 KB of
              // third-party JS if eagerly loaded.
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0 grayscale-[0.85] contrast-[1.15] transition-[filter] duration-700 hover:grayscale-0"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function ContactRow({
  label,
  value,
  href,
  accent = false,
}: {
  label: string;
  value: string;
  href?: string;
  accent?: boolean;
}) {
  const body = (
    <>
      <span className="w-full shrink-0 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.18em] text-[var(--fg-subtle)] md:w-32">
        {label}
      </span>
      <span
        className={[
          'text-sm leading-relaxed transition-transform duration-500 [transition-timing-function:var(--ease-out-expo)]',
          accent ? 'text-[var(--accent-text)]' : 'text-[var(--fg)]',
          href ? 'group-hover:translate-x-1.5' : '',
        ].join(' ')}
      >
        {value}
      </span>
    </>
  );

  const className = 'group flex flex-col gap-1 border-b border-[var(--line)] py-4 md:flex-row md:items-baseline md:gap-6';

  return href ? (
    <a href={href} data-cursor="link" className={className}>
      {body}
    </a>
  ) : (
    <div className={className}>{body}</div>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Enquiry form.
 *
 * There is no backend in this project, so rather than a dead form or a fake
 * success state, submitting composes a structured WhatsApp message and hands
 * off to the number in `lib/site.ts` — which is how this business actually
 * receives enquiries, and works from the moment the site goes live.
 *
 * ▸ TO POST TO A SERVER INSTEAD: replace the body of `handleSubmit` with a
 *   fetch to your endpoint (see README). Validation and state are already here.
 */
function EnquiryForm() {
  const uid = useId();
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = new FormData(e.currentTarget);
    const name = String(data.get('name') ?? '').trim();
    const phone = String(data.get('phone') ?? '').trim();
    const vehicle = String(data.get('vehicle') ?? '');
    const enquiry = String(data.get('enquiry') ?? '');
    const message = String(data.get('message') ?? '').trim();

    const next: Errors = {};
    if (name.length < 2) next.name = 'Please enter your name.';
    // Deliberately permissive: Indian numbers get written with +91, spaces,
    // hyphens and leading zeros, and rejecting valid formats loses enquiries.
    if (!/^[\d+\-\s()]{8,18}$/.test(phone)) next.phone = 'Please enter a reachable phone number.';
    if (message.length < 10) next.message = 'A short description of the damage helps us prepare.';

    setErrors(next);

    if (Object.keys(next).length > 0) {
      // Move focus to the first problem so keyboard and screen-reader users
      // aren't left guessing why nothing happened.
      formRef.current?.querySelector<HTMLElement>(`[aria-invalid="true"]`)?.focus();
      return;
    }

    const body = [
      `New enquiry — ${site.name}`,
      '',
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Vehicle: ${vehicle}`,
      `Enquiry: ${enquiry}`,
      '',
      message,
    ].join('\n');

    window.open(
      `https://wa.me/${site.contact.whatsapp.number}?text=${encodeURIComponent(body)}`,
      '_blank',
      'noopener,noreferrer'
    );

    setSent(true);
  };

  return (
    <Reveal variant="rise" delay={0.1}>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        noValidate
        className="surface-metal rounded-[var(--radius-card)] p-6 md:p-9"
        aria-describedby={`${uid}-note`}
      >
        <p className="t-meta">Request Inspection</p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <Field
            id={`${uid}-name`}
            name="name"
            label="Name"
            autoComplete="name"
            error={errors.name}
            required
          />
          <Field
            id={`${uid}-phone`}
            name="phone"
            label="Phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            error={errors.phone}
            required
          />

          <Select id={`${uid}-vehicle`} name="vehicle" label="Vehicle type" options={[...contact.vehicleTypes]} />
          <Select id={`${uid}-enquiry`} name="enquiry" label="Enquiry" options={[...contact.enquiryTypes]} />

          <div className="sm:col-span-2">
            <Field
              id={`${uid}-message`}
              name="message"
              label="What happened?"
              multiline
              error={errors.message}
              required
            />
          </div>
        </div>

        <div className="mt-9 flex flex-wrap items-center gap-5">
          <Button type="submit" variant="primary">
            Send Enquiry
          </Button>

          {/* Politely announced without stealing focus. */}
          <p role="status" aria-live="polite" className="text-sm text-[var(--fg-muted)]">
            {sent ? 'Opening WhatsApp with your details…' : ''}
          </p>
        </div>

        <p id={`${uid}-note`} className="mt-6 text-xs leading-relaxed text-[var(--fg-subtle)]">
          Submitting opens WhatsApp with your details pre-filled so you can send them
          directly to our service desk. Prefer email?{' '}
          <a href={`mailto:${site.contact.email}`} className="text-[var(--fg-muted)] underline underline-offset-4">
            {site.contact.email}
          </a>
        </p>
      </form>
    </Reveal>
  );
}

/* -------------------------------------------------------------------------- */

function Field({
  id,
  name,
  label,
  type = 'text',
  multiline = false,
  error,
  required,
  autoComplete,
  inputMode,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  multiline?: boolean;
  error?: string;
  required?: boolean;
  autoComplete?: string;
  inputMode?: 'tel' | 'text' | 'email';
}) {
  const shared = {
    id,
    name,
    required,
    autoComplete,
    inputMode,
    'aria-invalid': error ? ('true' as const) : undefined,
    'aria-describedby': error ? `${id}-error` : undefined,
    className:
      'peer w-full border-0 border-b border-[var(--line-strong)] bg-transparent px-0 pb-2 pt-1 text-[var(--fg)] outline-none transition-colors placeholder:text-transparent focus:border-[var(--color-red)] aria-[invalid=true]:border-[var(--color-red)]',
    placeholder: label,
  };

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className="mb-2 block font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.18em] text-[var(--fg-subtle)]"
      >
        {label}
        {required && <span className="ml-1 text-[var(--accent-text)]">*</span>}
      </label>

      {multiline ? <textarea rows={4} {...shared} /> : <input type={type} {...shared} />}

      {error && (
        <p id={`${id}-error`} className="mt-2 text-xs text-[var(--accent-text)]">
          {error}
        </p>
      )}
    </div>
  );
}

function Select({ id, name, label, options }: { id: string; name: string; label: string; options: string[] }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.18em] text-[var(--fg-subtle)]"
      >
        {label}
      </label>
      <select
        id={id}
        name={name}
        defaultValue={options[0]}
        className="w-full appearance-none border-0 border-b border-[var(--line-strong)] bg-transparent px-0 pb-2 pt-1 text-[var(--fg)] outline-none transition-colors focus:border-[var(--color-red)]"
      >
        {options.map((option) => (
          // Explicit background: native option lists don't inherit the theme,
          // and transparent text on white is a real failure on Windows.
          <option key={option} value={option} className="bg-[var(--bg-raised)] text-[var(--fg)]">
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
