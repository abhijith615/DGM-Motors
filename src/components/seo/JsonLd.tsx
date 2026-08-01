import { services, site } from '@/lib/site';

/**
 * Structured data.
 *
 * `AutoRepair` is the correct schema.org type for a workshop and unlocks the
 * local-business rich result (hours, phone, map pin) for the queries this site
 * targets — "commercial vehicle repair Tamil Nadu" and friends are local-intent
 * searches, so this is doing more SEO work than any amount of copy.
 *
 * Rendered as a plain <script> in the server component: no client JS, and it's
 * in the initial HTML where crawlers actually look.
 */
export function JsonLd() {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['AutoRepair', 'LocalBusiness'],
        '@id': `${site.url}/#business`,
        name: site.name,
        legalName: site.legalName,
        description: site.description,
        url: site.url,
        telephone: site.contact.phone.tel,
        email: site.contact.email,
        image: `${site.url}/brand/og.png`,
        logo: `${site.url}/brand/logo-horizontal.png`,
        priceRange: '₹₹',
        address: {
          '@type': 'PostalAddress',
          streetAddress: site.address.street,
          addressLocality: site.address.locality,
          addressRegion: site.address.region,
          postalCode: site.address.postalCode,
          addressCountry: site.address.country,
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: site.address.lat,
          longitude: site.address.lng,
        },
        areaServed: site.serviceAreas.map((name) => ({
          '@type': 'AdministrativeArea',
          name,
        })),
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            opens: '09:00',
            closes: '20:00',
          },
        ],
        // Surfaces the full service list as a browsable catalogue in results.
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Commercial Vehicle Services',
          itemListElement: services.map((service) => ({
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: service.title,
              description: service.body,
            },
          })),
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${site.url}/#website`,
        url: site.url,
        name: site.name,
        publisher: { '@id': `${site.url}/#business` },
        inLanguage: 'en-IN',
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is not HTML — the only sequence that could break
      // out is "</script>", which cannot appear in this data.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
