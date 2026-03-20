/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: '/confess',    destination: '/wall',     permanent: true },
      { source: '/confession', destination: '/wall',     permanent: true },
      { source: '/miracle',    destination: '/wall',     permanent: true },
      { source: '/miracles',   destination: '/wall',     permanent: true },
      { source: '/coach',      destination: '/guardian', permanent: true },
      { source: '/ai-coach',   destination: '/guardian', permanent: true },
    ]
  },
}

module.exports = nextConfig
