import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'

const withNextIntl = createNextIntlPlugin()

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'crm-technodevlabs.s3.eu-west-2.amazonaws.com', protocol: 'https', port: '' }
    ]
  },
  experimental: { serverActions: { bodySizeLimit: '7mb' } }
}

export default withNextIntl(nextConfig)
