/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Cache-Control',    value: 'no-store, no-cache, must-revalidate, max-age=0' },
          { key: 'Referrer-Policy',  value: 'no-referrer' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          {
            key: 'Permissions-Policy',
            value: [
              'camera=()',
              'microphone=(self)',
              'geolocation=(self)',
              'interest-cohort=()',
            ].join(', '),
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "connect-src 'self' https://*.supabase.co https://api.stripe.com https://generativelanguage.googleapis.com https://nominatim.openstreetmap.org https://ipapi.co",
              "img-src 'self' data: blob:",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "frame-src 'none'",
              "object-src 'none'",
            ].join('; '),
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control',          value: 'no-store' },
          { key: 'CDN-Cache-Control',       value: 'no-store' },
          { key: 'Vercel-CDN-Cache-Control', value: 'no-store' },
        ],
      },
    ];
  },

  async redirects() {
    return [
      { source: '/confess',    destination: '/wall',     permanent: true },
      { source: '/confession', destination: '/wall',     permanent: true },
      { source: '/miracle',    destination: '/wall',     permanent: true },
      { source: '/miracles',   destination: '/wall',     permanent: true },
      { source: '/coach',      destination: '/guardian', permanent: true },
      { source: '/ai-coach',   destination: '/guardian', permanent: true },
    ];
  },

  poweredByHeader: false,
};

module.exports = nextConfig;
